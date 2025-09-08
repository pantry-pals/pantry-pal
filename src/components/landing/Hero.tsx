// src/components/Hero.tsx
import React from "react";

export default function Hero() {
  return (
    <section className="container py-5">
      <div className="row align-items-center">
        {/* Image Section */}
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <img
              src="/Pantry.jpg"
              alt="Pantry"
            />
          </div>
        </div>

        {/* Text Section */}
        <div className="col-md-6">
          <h2 className="fw-bold">Medium length hero headline</h2>
          <p className="text-muted">
            Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos cu
            eum an brute copiosae hendrerit.
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-dark">Log In</button>
            <button className="btn btn-outline-dark">Sign Up</button>
          </div>
        </div>
      </div>
    </section>
  );
}
