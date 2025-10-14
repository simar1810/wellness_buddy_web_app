import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { retrieveQuestionaire } from "@/lib/fetchers/app";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import { useAppSelector } from "@/providers/global/hooks";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { clientOnboardingCompleted } from "@/config/state-reducers/add-client-checkup";

export default function OnBoardingQuestionaire() {
  const { isLoading, error, data } = useSWR("app/questionaire", () => retrieveQuestionaire({ person: "coach" }));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const sections = data.data?.sections || [];

  return <div>
    <QuestionsContainer sections={sections} />
  </div>
}

function QuestionsContainer({ sections = [] }) {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState(sections);

  const { clientId, dispatch } = useCurrentStateContext();

  const updateAnswer = (sectionIndex, questionIndex, newAnswer) => {
    setFormState(prev => prev.map((section, index) => index === sectionIndex
      ? {
        ...section,
        questions: section.questions
          .map((question, idx) => idx === questionIndex
            ? {
              ...question,
              answer: newAnswer
            }
            : question
          )
      }
      : section))
  }

  async function saveClientQuestionaire() {
    try {
      setLoading(true);
      const response = await sendData("app/onboarding/questionaire/client?person=coach", {
        clientId,
        sections: formState
      });
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      dispatch(clientOnboardingCompleted());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    if (sections.length === 0) dispatch(clientOnboardingCompleted());
  }, [sections]);

  const renderQuestion = (question, sectionIndex, questionIndex) => {
    const questionId = `section-${sectionIndex}-question-${questionIndex}`

    switch (question.type) {
      case "shortAnswer":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={questionId}
              value={question.answer || ""}
              onChange={(e) => updateAnswer(sectionIndex, questionIndex, e.target.value)}
              placeholder="Enter your answer"
            />
          </div>
        )

      case "paragraph":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={questionId}
              value={question.answer || ""}
              onChange={(e) => updateAnswer(sectionIndex, questionIndex, e.target.value)}
              placeholder="Enter your detailed answer"
              rows={4}
            />
          </div>
        )

      case "multipleChoice":
        return (
          <div className="space-y-3">
            <Label>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={question.answer || ""}
              onValueChange={(value) => updateAnswer(sectionIndex, questionIndex, value)}
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionId}-${optionIndex}`} />
                  <Label htmlFor={`${questionId}-${optionIndex}`}>{option.trim()}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "checkBoxes":
        return (
          <div className="space-y-3">
            <Label>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => {
                const currentAnswers = question.answer ? question.answer.split(",") : []
                const isChecked = currentAnswers.includes(option)

                return (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${questionId}-${optionIndex}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newAnswers = [...currentAnswers]
                        if (checked) {
                          if (!newAnswers.includes(option)) {
                            newAnswers.push(option)
                          }
                        } else {
                          newAnswers = newAnswers.filter((ans) => ans !== option)
                        }
                        updateAnswer(sectionIndex, questionIndex, newAnswers.join(","))
                      }}
                    />
                    <Label htmlFor={`${questionId}-${optionIndex}`}>{option.trim()}</Label>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "dropdown":
        return (
          <div className="space-y-2">
            <Label>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={question.answer || ""}
              onValueChange={(value) => updateAnswer(sectionIndex, questionIndex, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option, optionIndex) => (
                  <SelectItem key={optionIndex} value={option}>
                    {option.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "linearScale":
        return (
          <div className="space-y-3">
            <Label>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{question.label1}</span>
                <span>{question.label2}</span>
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: question.maxScale - question.minScale + 1 }, (_, i) => question.minScale + i).map(
                  (value) => (
                    <Button
                      key={value}
                      variant={question.answer == value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAnswer(sectionIndex, questionIndex, value.toString())}
                    >
                      {value}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </div>
        )

      case "rating":
        return (
          <div className="space-y-3">
            <Label>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex space-x-1">
              {Array.from({ length: question.maxScale || 5 }, (_, i) => i + 1).map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={() => updateAnswer(sectionIndex, questionIndex, star.toString())}
                >
                  <Star
                    className={`h-6 w-6 ${Number.parseInt(question.answer) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                  />
                </Button>
              ))}
            </div>
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={questionId}
              type="date"
              value={question.answer || ""}
              onChange={(e) => updateAnswer(sectionIndex, questionIndex, e.target.value)}
            />
          </div>
        )

      case "time":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={questionId}
              type="time"
              value={question.answer || ""}
              onChange={(e) => updateAnswer(sectionIndex, questionIndex, e.target.value)}
            />
          </div>
        )

      case "attachFile":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.text}
              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={questionId}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  updateAnswer(sectionIndex, questionIndex, file.name)
                }
              }}
            />
            {question.answer && <p className="text-sm text-muted-foreground">Selected: {question.answer}</p>}
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label>Unsupported question type: {question.type}</Label>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Accordion type="single" className="w-full">
        {formState?.map((section, sectionIndex) => (
          <AccordionItem key={section._id} value={`section-${sectionIndex}`}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-[18px]">{section.name}</span>
                <span className="text-sm text-muted-foreground">
                  {section.questions?.length} question{section.questions?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pb-4">
                {section.questions?.map((question, questionIndex) => (
                  <div key={questionIndex} className="p-4 border rounded-lg">
                    {renderQuestion(question, sectionIndex, questionIndex)}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button
        variant="wz"
        className="w-full mt-8"
        disabled={loading}
        onClick={saveClientQuestionaire}
      >Save</Button>
    </div>
  )
}