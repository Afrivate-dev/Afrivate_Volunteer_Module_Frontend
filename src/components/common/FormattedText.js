import React from "react";
import { formatTextContent } from "../../utils/descriptionUtils";

/**
 * Component that renders formatted text with support for:
 * - Bullet points (lines starting with -, *, or •)
 * - Numbered lists (lines starting with 1., 2., etc.)
 * - Line breaks and paragraphs
 */
const FormattedText = ({ text, className = "" }) => {
  if (!text) return null;

  const elements = formatTextContent(text);

  return (
    <div className={`formatted-text ${className}`}>
      {elements.map((el) => {
        if (el.type === "ul") {
          return (
            <ul key={el.key} className="list-disc list-inside space-y-1 my-2 ml-2">
              {el.items.map((item, idx) => (
                <li key={`${el.key}-item-${idx}`} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (el.type === "ol") {
          return (
            <ol key={el.key} className="list-decimal list-inside space-y-1 my-2 ml-2">
              {el.items.map((item, idx) => (
                <li key={`${el.key}-item-${idx}`} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ol>
          );
        }

        if (el.type === "br") {
          return <div key={el.key} className="h-2" />;
        }

        if (el.type === "p") {
          return (
            <p key={el.key} className="text-gray-700 leading-relaxed">
              {el.content}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
};

export default FormattedText;
