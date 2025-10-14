"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import CheckboxDisplay from "@/components/pages/coach/questionaire/display/CheckboxDisplay";
import DateDisplay from "@/components/pages/coach/questionaire/display/DateDisplay";
import DropdownDisplay from "@/components/pages/coach/questionaire/display/DropdownDisplay";
import FileUploadDisplay from "@/components/pages/coach/questionaire/display/FileUploadDisplay";
import LinearScaleDisplay from "@/components/pages/coach/questionaire/display/LinearScaleDisplay";
import MultipleChoiceDisplay from "@/components/pages/coach/questionaire/display/MultipleChoiceDisplay";
import ParagraphDisplay from "@/components/pages/coach/questionaire/display/ParagraphDisplay";
import RatingDisplay from "@/components/pages/coach/questionaire/display/RatingDisplay";
import ShortAnswerDisplay from "@/components/pages/coach/questionaire/display/ShortAnswerDisplay";
import TimeDisplay from "@/components/pages/coach/questionaire/display/TimeDisplay";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { onboardingQuestionaire } from "@/lib/fetchers/app";
import Link from "next/link";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("onboarding-questionaire", () => onboardingQuestionaire());

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error?.message || data?.message} />
  const sections = data.data.sections || []

  return <div className="content-container content-height-screen">
    <div className="flex items-center justify-between">
      <h4>Onboarding Questions</h4>
      <Link
        className="px-4 py-2 font-bold bg-[var(--accent-1)] text-white rounded-[8px]"
        href="/coach/tools/questionaire/edit"
        variant="wz"
      >
        Edit
      </Link>
    </div>
    <OnboardingQuestionContainer sections={sections} />
  </div>
}

export function OnboardingQuestionContainer({ sections }) {
  return <div className="mt-10 grid grid-cols-2 gap-4">
    {sections.map(section => <Collapsible key={section._id}>
      <CollapsibleTrigger className="w-full text-left font-bold bg-[var(--comp-1)] px-4 py-2 border-1">
        {section.name}
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-[var(--comp-1)] p-4 rounded-b-[4px] border-1">
        <h5>Questions - ({section.questions.length})</h5>
        <div className="mt-4">
          {section.questions.map((question, index) => <QuestionDetails
            key={index}
            index={index}
            question={question}
          />)}
        </div>
      </CollapsibleContent>
    </Collapsible>)}
  </div>
}

function QuestionDetails({ index, question }) {
  return <Collapsible className="mb-2">
    <CollapsibleTrigger className="font-bold w-full text-left bg-white px-4 py-1 border-1">
      {index}{")"} {question.text}
    </CollapsibleTrigger>
    <CollapsibleContent className="bg-white p-4 border-1 rounded-[4px]">
      {renderQuestionDisplayComponent(question)}
    </CollapsibleContent>
  </Collapsible>
}

function renderQuestionDisplayComponent(question) {
  switch (question.type) {
    case "multipleChoice":
      return <MultipleChoiceDisplay question={question} />;
    case "dropdown":
      return <DropdownDisplay question={question} />;
    case "shortAnswer":
      return <ShortAnswerDisplay question={question} />;
    case "paragraph":
      return <ParagraphDisplay question={question} />;
    case "checkBoxes":
      return <CheckboxDisplay question={question} />;
    case "linearScale":
      return <LinearScaleDisplay question={question} />;
    case "rating":
      return <RatingDisplay question={question} />;
    case "date":
      return <DateDisplay question={question} />;
    case "time":
      return <TimeDisplay question={question} />;
    case "attachFile":
      return <FileUploadDisplay question={question} />;
    default:
      return <ShortAnswerDisplay question={question} />;
  }
};