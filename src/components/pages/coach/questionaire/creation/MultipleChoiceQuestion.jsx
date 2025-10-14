"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from 'lucide-react';

export default function MultipleChoiceQuestion({ question, onUpdate }) {
  const updateQuestion = (updates) => {
    onUpdate({ ...question, ...updates });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ""];
    updateQuestion({ options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    updateQuestion({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Input
          id="question-text"
          value={question.text || ""}
          onChange={(e) => updateQuestion({ text: e.target.value })}
          placeholder="Enter your question"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="mandatory"
          checked={question.isMandatory || false}
          onCheckedChange={(checked) => updateQuestion({ isMandatory: checked })}
        />
        <Label htmlFor="mandatory">Required</Label>
      </div>

      <div>
        <Label>Options</Label>
        <div className="space-y-2 mt-2">
          {(question.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeOption(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addOption}>
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
    </div>
  );
}
