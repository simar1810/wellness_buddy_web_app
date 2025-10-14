"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import QuestionDetailsModal from "@/components/pages/coach/questionaire/QuestionDetailsModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import questionaireReducer, { addNewQuestionToSection, generateQuestionaireRP, newSection, questionaireInitialState, removeSection, saveSection } from "@/config/state-reducers/questionaire";
import { sendData } from "@/lib/api";
import { onboardingQuestionaire } from "@/lib/fetchers/app";
import { cn } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { File, Minus, Pen, Plus, Star, Upload } from 'lucide-react';
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("onboarding-questionaire", () => onboardingQuestionaire());

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const sections = data.data.sections || []

  return <QuestionaireWrapper sections={sections} />
}

function QuestionaireWrapper({ sections }) {
  return <div className="content-container content-height-screen">
    <CurrentStateProvider
      state={questionaireInitialState(sections)}
      reducer={questionaireReducer}
    >
      <QuestionaireContainer />
    </CurrentStateProvider>
  </div>
}

function QuestionaireContainer() {
  const [loading, setLoading] = useState(false);
  const { dispatch, ...state } = useCurrentStateContext();

  async function saveQuestionaire() {
    try {
      setLoading(true);
      const payload = generateQuestionaireRP(state.sections)
      const response = await sendData("app/onboarding/questionaire", { sections: payload });
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (Object.keys(state.sections).length === 0)
    return (
      <div>
        <PageHeader />
        <ContentError
          title="Please add a section!"
          className="font-bold bg-[var(--comp-2)]"
        />
      </div>
    );

  return (
    <div>
      <PageHeader />
      <SectionList />
      <Button
        className="block mx-auto mt-10"
        variant="wz"
        disabled={loading}
        onClick={saveQuestionaire}
      >Save</Button>
    </div>
  );
}

function PageHeader() {
  const { dispatch } = useCurrentStateContext();

  return (
    <div className="flex items-center justify-between">
      <h4>Onboarding Questions</h4>
      <Button onClick={() => dispatch(newSection())} variant="wz">
        <Plus strokeWidth={3} />
        Add New
      </Button>
    </div>
  );
}

function SectionList() {
  const { sections } = useCurrentStateContext();

  return (
    <div className="mt-10 grid grid-cols-2 gap-4">
      {Object.keys(sections).map((section) => (
        <SectionDetails key={section} sectionKey={section} />
      ))}
    </div>
  );
}

function SectionDetails({ sectionKey }) {
  const { sections, dispatch } = useCurrentStateContext();
  const { name, questions } = sections[sectionKey];

  return (
    <Collapsible>
      <div className="bg-[var(--comp-2)] border-1 pr-2 flex items-center justify-between gap-4">
        <CollapsibleTrigger className={cn("text-left grow px-4 py-3")}>
          <h5>{name}</h5>
        </CollapsibleTrigger>
        <UpdateSectionModal
          key={sections[sectionKey].questions.length}
          sectionKey={sectionKey}
        />
        <Minus
          className="w-[18px] h-[18px] bg-[var(--accent-2)] text-white p-[2px] rounded-full cursor-pointer"
          onClick={() => dispatch(removeSection(sectionKey))}
        />
      </div>
      <CollapsibleContent className="px-4 py-3 border-1 bg-[var(--comp-2)] rounded-b-[8px]">
        {questions.map((question, index) => (
          <QuestionDetailsModal
            key={index}
            sectionKey={sectionKey}
            question={question}
            index={index}
          />
        ))}
        <Button
          size="sm"
          variant="wz"
          className="mt-4 mx-auto block"
          onClick={() => dispatch(addNewQuestionToSection(sectionKey))}
        >
          Add Question
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function QuestionPreview({ question }) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case "multipleChoice":
        return (
          <RadioGroup value={question.answer} className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "shortAnswer":
        return (
          <Input
            placeholder="Short answer text"
            value={question.answerText || ""}
            readOnly
            className="bg-gray-50"
          />
        );

      case "paragraph":
        return (
          <Textarea
            placeholder="Long answer text"
            value={question.answerText || ""}
            readOnly
            className="bg-gray-50 min-h-[80px]"
          />
        );

      case "checkBoxes":
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={question.answer?.includes(option)}
                />
                <Label htmlFor={`checkbox-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "dropdown":
        return (
          <Select value={question.answer}>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "linearScale":
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.label1}</span>
              <span>{question.label2}</span>
            </div>
            <div className="flex justify-between items-center">
              {Array.from(
                { length: question.maxScale - question.minScale + 1 },
                (_, i) => question.minScale + i
              ).map((value) => (
                <div key={value} className="flex flex-col items-center">
                  <RadioGroup value={question.answer?.toString()}>
                    <RadioGroupItem
                      value={value.toString()}
                      id={`scale-${value}`}
                    />
                  </RadioGroup>
                  <Label htmlFor={`scale-${value}`} className="text-sm mt-1">
                    {value}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "rating":
        return (
          <div className="flex space-x-1">
            {Array.from({ length: question.maxScale }, (_, i) => i + 1).map(
              (star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-6 h-6 cursor-pointer",
                    star <= question.answer
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              )
            )}
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={question.dateTime || ""}
            readOnly
            className="bg-gray-50"
          />
        );

      case "time":
        return (
          <Input
            type="time"
            value={question.answer || ""}
            readOnly
            className="bg-gray-50"
          />
        );

      case "attachFile":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {question.answer === "Uploaded" ? (
                <span className="text-green-600 flex items-center justify-center gap-2">
                  <File className="w-4 h-4" />
                  File uploaded
                </span>
              ) : (
                "Click to upload or drag and drop"
              )}
            </p>
          </div>
        );

      default:
        return <div className="text-gray-500">Unknown question type</div>;
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {question.type.replace(/([A-Z])/g, " $1").trim()}
      </div>
      {renderQuestionInput()}
    </div>
  );
}

function UpdateSectionModal({ sectionKey }) {
  const { sections, dispatch } = useCurrentStateContext();
  const { name, questions } = sections[sectionKey];
  const [payload, setPayload] = useState({ name, questions });

  return (
    <Dialog>
      <DialogTrigger asChild className="ml-auto">
        <Pen className="w-[18px] h-[18px] cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="p-0 max-w-[600px] w-full gap-0 max-h-[80vh] overflow-y-auto">
        <DialogTitle className="p-4 border-b-1">{name}</DialogTitle>
        <div className="p-4 overflow-y-auto">
          <FormControl
            value={payload.name}
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, name: e.target.value }))
            }
            label="Section Name"
          />

          <div className="mt-6">
            <h6 className="font-medium mb-4 text-gray-900">
              Questions ({questions.length})
            </h6>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions in this section yet.
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionPreview key={index} question={question} />
                ))}
              </div>
            )}
          </div>

          <Button
            variant="wz"
            size="sm"
            className="block mt-6 mx-auto"
            onClick={() =>
              dispatch(saveSection({ sectionKey, values: payload }))
            }
          >
            Save Section
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
