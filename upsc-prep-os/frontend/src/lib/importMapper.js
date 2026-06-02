export function mapImportedQuestion(question) {
  return {
    id:
      question.id ||
      crypto.randomUUID(),

    questionText:
      question.questionText || "",

    options:
      question.options || [],

    correctOption:
      question.correctOption || "",

    explanation:
      question.explanation || "",

    year:
      question.year || null,

    subject:
      question.subjectName ||
      question.subject ||
      "",

    topic:
      question.topicName ||
      question.topic ||
      "",

    subTopic:
      question.subtopicName ||
      question.subTopic ||
      "",

    reviewStatus: "Pending",

    isMalformed: false,

    parseWarnings: [],
  };
}

export function toDBFormat(questions) {
  return questions.map((q) => ({
    questionText: q.questionText,

    options: q.options || [],

    correctOption: q.correctOption || "",

    explanation: q.explanation || "",

    year: q.year || null,

    subjectName: q.subject || "",

    topicName: q.topic || "",

    subtopicName: q.subTopic || "",
  }));
}