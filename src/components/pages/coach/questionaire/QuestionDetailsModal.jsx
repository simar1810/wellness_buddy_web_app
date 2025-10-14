"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Minus } from 'lucide-react';
import QuestionEditor from "./QuestionEditor";
import { removeQuestion, updateQuestion } from "@/config/state-reducers/questionaire";
import useCurrentStateContext from "@/providers/CurrentStateContext";

export default function QuestionDetailsModal({ sectionKey, question, index }) {
  const { dispatch } = useCurrentStateContext();

  const handleQuestionUpdate = (updatedQuestion) => {
    dispatch(updateQuestion({
      sectionKey,
      questionIndex: index,
      questionData: updatedQuestion
    }));
  };

  const handleRemoveQuestion = () => {
    dispatch(removeQuestion({ sectionKey, index }));
  };

  return (
    <Dialog>
      <div className="bg-white flex items-center justify-between px-4 py-2 border-1 mb-2">
        <DialogTrigger className="grow flex items-center justify-between">
          <p>{question.name}</p>
        </DialogTrigger>
        <Minus
          className="w-[18px] h-[18px] bg-[var(--accent-2)] text-white p-[2px] rounded-full cursor-pointer"
          onClick={handleRemoveQuestion}
        />
      </div>
      <DialogContent className="p-0 max-w-[600px] w-full max-h-[80vh] overflow-y-auto gap-0">
        <DialogTitle className="p-4 border-b-1">
          Edit Question: {question.name}
        </DialogTitle>
        <div className="p-4 overflow-y-auto">
          <QuestionEditor
            question={question}
            onUpdate={handleQuestionUpdate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
