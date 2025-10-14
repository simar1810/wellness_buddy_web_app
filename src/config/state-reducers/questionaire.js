export default function questionaireReducer(state, action) {
  switch (action.type) {
    case "ADD_NEW_SECTION": {
      const existingNames = Object.values(state.sections).map((sec) => sec.name)
      let count = 1
      let newSectionName = `Untitled Section ${count}`
      while (existingNames.includes(newSectionName)) {
        count++;
        newSectionName = `Untitled Section ${count}`;
      }
      const newSectionKey = `section-${Date.now()}`;
      return {
        ...state,
        sections: {
          ...state.sections,
          [newSectionKey]: {
            name: newSectionName,
            questions: [],
          },
        },
      }
    }
    case "REMOVE_SECTION": {
      delete state.sections[action.payload]
      return {
        ...state
      };
    }
    case "SAVE_SECTION": {
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.payload.sectionKey]: action.payload.values
        }
      }
    }
    case "ADD_NEW_QUESTION_SECTION": {
      return ({
        ...state,
        sections: {
          ...state.sections,
          [action.payload]: {
            ...state.sections[action.payload],
            questions: [...state.sections[action.payload].questions,
            {
              id: `Q${Date.now()}`,
              name: `Question ${state.sections[action.payload].questions.length + 1}`,
              type: "shortAnswer",
              text: "",
              options: [],
              isMandatory: false,
              minScale: null,
              maxScale: null,
              label1: null,
              label2: null,
              dateTime: null,
              imagePath: null,
              filePath: null,
              answerText: null,
              answer: null
            }
            ]
          }
        }
      })
    }
    case "REMOVE_QUESTION":
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.payload.sectionKey]: {
            ...state.sections[action.payload.sectionKey],
            questions: state.sections[action.payload.sectionKey].questions.filter((_, index) => index !== action.payload.index)
          }
        }
      }
    case "UPDATE_QUESTION": {
      const { sectionKey, questionIndex, questionData } = action.payload;
      return {
        ...state,
        sections: {
          ...state.sections,
          [sectionKey]: {
            ...state.sections[sectionKey],
            questions: state.sections[sectionKey].questions.map((question, index) =>
              index === questionIndex ? { ...question, ...questionData } : question
            )
          }
        }
      }
    }
    default:
      return {
        ...state
      };
  }
}

export function newSection() {
  return {
    type: "ADD_NEW_SECTION"
  }
}

export function removeSection(payload) {
  return {
    type: "REMOVE_SECTION",
    payload
  }
}

export function saveSection(payload) {
  return {
    type: "SAVE_SECTION",
    payload
  }
}

export function addNewQuestionToSection(payload) {
  return {
    type: "ADD_NEW_QUESTION_SECTION",
    payload
  }
}

export function removeQuestion(payload) {
  return {
    type: "REMOVE_QUESTION",
    payload
  }
}

export function updateQuestion(payload) {
  return {
    type: "UPDATE_QUESTION",
    payload
  }
}

export function questionaireInitialState(sections = []) {
  const transformedSections = {}

  sections.forEach((section, sectionIndex) => {
    const sectionId = `section-${Date.now() + sectionIndex}`
    const transformedQuestions = []

    section.questions.forEach((question, questionIndex) => {
      const questionId = `Q${Date.now() + questionIndex}`
      transformedQuestions.push({
        id: questionId,
        name: `Question ${questionIndex + 1}`,
        type: question.type || null,
        text: question.text || "",
        options: question.options || [],
        isMandatory: question.isMandatory ?? false,
        answer: null,
        answerText: null,
        dateTime: null,
        filePath: null,
        imagePath: null,
        minScale: null,
        maxScale: null,
        label1: null,
        label2: null,
        ...question,
      })
    })

    transformedSections[sectionId] = {
      name: section.name || `Untitled Section ${sectionIndex + 1}`,
      questions: transformedQuestions,
    }
  })

  return {
    sections: transformedSections
  }
}

export function generateQuestionaireRP(data) {
  const sections = Object.values(data).map((section, sectionIndex) => {
    return {
      name: section.name || `Section ${sectionIndex + 1}`,
      questions: section.questions.map((q) => {
        return {
          type: q.type || undefined,
          text: q.text || undefined,
          options: q.options || [],
          isMandatory: q.isMandatory ?? false,
          answer: q.answer ?? undefined,
          answerText: q.answerText ?? undefined,
          dateTime: q.dateTime ?? undefined,
          filePath: q.filePath ?? undefined,
          imagePath: q.imagePath ?? undefined,
          minScale: q.minScale ?? undefined,
          maxScale: q.maxScale ?? undefined,
          label1: q.label1 ?? undefined,
          label2: q.label2 ?? undefined
        }
      })
    }
  })

  return sections;
}