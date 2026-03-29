import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../utils/components/Footer';
import TutorialModal from '../utils/components/TutorialModal/TutorialModal';
import {
  LandingHero,
  LandingFeatureHighlights,
  LandingHowItWorks,
  LandingProductDeepDive,
  LandingFinalCta,
} from './HomeLandingSections';

export default function HomePage() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {showTutorial && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      )}

      <main className="flex-grow w-full">
        <LandingHero
          navigate={navigate}
          onOpenTutorial={() => setShowTutorial(true)}
        />
        <LandingFeatureHighlights />
        <LandingHowItWorks />
        <LandingProductDeepDive />
        <LandingFinalCta navigate={navigate} />
      </main>

      <Footer />
    </div>
  );
}
