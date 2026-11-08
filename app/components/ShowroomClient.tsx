"use client";

import dynamic from "next/dynamic";

const InteractiveShowroom = dynamic(
  () => import("./InteractiveShowroom"),
  {
    ssr: false,
    loading: () => (
      <section className="showroom-section" id="showroom">
        <div className="showroom-loading">Preparing the interactive showroom…</div>
      </section>
    )
  }
);

export default function ShowroomClient() {
  return <InteractiveShowroom />;
}
