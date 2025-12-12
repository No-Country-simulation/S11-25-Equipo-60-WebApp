import { FeatureSection } from "./FeatureSection";
import { featuresData } from "./featuresData";

export const FeaturesSection = () => {
  return (
    <>
      {featuresData.map((feature) => (
        <FeatureSection
          key={feature.title}
          title={feature.title}
          description={feature.description}
          features={feature.features}
          imageSrc={feature.imageSrc}
          imageAlt={feature.imageAlt}
          imagePosition={feature.imagePosition}
        />
      ))}
    </>
  );
};
