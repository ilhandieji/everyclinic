import { Heart, Shield, Stethoscope, Syringe } from "lucide-react";

export function HeroMark() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="hero-stage__shape" />
      <span className="hero-stage__icon hero-stage__icon--heart">
        <Heart />
      </span>
      <span className="hero-stage__icon hero-stage__icon--scope">
        <Stethoscope />
      </span>
      <span className="hero-stage__icon hero-stage__icon--late hero-stage__icon--shield">
        <Shield />
      </span>
      <span className="hero-stage__icon hero-stage__icon--late hero-stage__icon--syringe">
        <Syringe />
      </span>
    </div>
  );
}
