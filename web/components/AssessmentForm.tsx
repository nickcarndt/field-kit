"use client";

import Link from "next/link";
import { useState } from "react";
import {
  scoreAnswers,
  type AxisScore,
  type RoadmapEntry,
} from "@/lib/assess";
import type { Pattern } from "@/lib/types";

type Answers = Record<string, Array<number | null>>;

// "0 — Not present: does not exist today" -> "Not present"
function shortAnchor(full: string): string {
  return full.split("—")[1]?.split(":")[0]?.trim() ?? "";
}

function emptyAnswers(assessment: Pattern): Answers {
  return Object.fromEntries(
    assessment.axes.map((a) => [a.key, a.items.map(() => null)]),
  );
}

export function AssessmentForm({
  assessment,
  catalog,
}: {
  assessment: Pattern;
  catalog: Pattern[];
}) {
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(assessment));
  const [incomplete, setIncomplete] = useState(false);
  const [result, setResult] = useState<{
    profile: AxisScore[];
    roadmap: RoadmapEntry[];
  } | null>(null);

  const total = assessment.axes.reduce((n, a) => n + a.items.length, 0);
  const answered = Object.values(answers)
    .flat()
    .filter((v) => v !== null).length;
  const complete = answered === total;

  function setScore(axisKey: string, itemIndex: number, value: number) {
    setAnswers((prev) => ({
      ...prev,
      [axisKey]: prev[axisKey].map((v, i) => (i === itemIndex ? value : v)),
    }));
    setIncomplete(false);
  }

  function onSubmit() {
    if (!complete) {
      setIncomplete(true);
      return;
    }
    setResult(
      scoreAnswers(
        catalog,
        assessment,
        Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [k, v as number[]]),
        ),
      ),
    );
  }

  return (
    <div className="assess-form">
      <section className="scale-legend" aria-label="Scoring anchors">
        <h2>Anchors</h2>
        <ul>
          {assessment.scale.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </section>

      {assessment.axes.map((axis) => (
        <section className="axis-group" key={axis.key}>
          <h2 className="axis-title">{axis.name}</h2>
          {axis.items.map((item, i) => (
            <div className="scoring" role="radiogroup" aria-label={item} key={item}>
              <p className="statement">{item}</p>
              <div className="score-row">
                {[0, 1, 2, 3].map((value) => {
                  const id = `${axis.key}-${i}-${value}`;
                  return (
                    <span key={value}>
                      <input
                        type="radio"
                        id={id}
                        name={`${axis.key}-${i}`}
                        checked={answers[axis.key][i] === value}
                        onChange={() => setScore(axis.key, i, value)}
                        aria-label={assessment.scale[value]}
                      />
                      {/* Anchor word ON the control — nobody should need to
                          remember the legend, and title= is invisible on touch. */}
                      <label htmlFor={id} title={assessment.scale[value]}>
                        <span className="score-num">{value}</span>
                        {shortAnchor(assessment.scale[value])}
                      </label>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="assess-actions">
        <p className="assess-progress">{answered} / {total} scored</p>
        <button type="button" onClick={onSubmit}>
          Score the practice
        </button>
        <p className="find-caption">
          Same bands as the live server, computed in your browser. No model
          call.
        </p>
      </div>
      {incomplete ? (
        <p className="error-state" role="status">
          Score every statement before you can see a profile.
        </p>
      ) : null}

      {result ? (
        <div className="assess-result">
          <section aria-label="Maturity profile">
            <h2 className="axis-title">Profile</h2>
            <ul className="profile-list">
              {result.profile.map((p) => (
                <li key={p.axis}>
                  <span className="profile-name">{p.name}</span>
                  <span className="profile-score">{p.score.toFixed(2)}</span>
                  <span className="kills-stamp">{p.level}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Roadmap">
            <h2 className="axis-title">Roadmap</h2>
            {result.roadmap.length ? (
              <ul className="chip-list">
                {result.roadmap.map((r) => (
                  <li key={r.axis}>
                    <Link href={`/patterns/${r.patternSlug}`} className="reco-chip">
                      <span className="reco-id">{r.patternId}</span>
                      <span className="reco-name">{r.patternName}</span>
                      <span className="reco-reason">
                        {r.name} scored {r.score.toFixed(2)} ({r.level}) — start
                        here: {r.thesis}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">
                No axis below the gap line. Revisit at the next quarterly review.
              </p>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
