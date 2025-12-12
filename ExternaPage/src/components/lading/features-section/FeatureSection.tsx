"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}

export const FeatureSection = ({
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  imagePosition,
}: FeatureSectionProps) => {
  const isImageLeft = imagePosition === "left";

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            isImageLeft ? "" : "lg:grid-flow-dense"
          }`}
        >
          {/* Image */}
          <div className={`${isImageLeft ? "lg:col-start-1" : "lg:col-start-2"}`}>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className={`${isImageLeft ? "lg:col-start-2" : "lg:col-start-1"}`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {description}
            </p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
