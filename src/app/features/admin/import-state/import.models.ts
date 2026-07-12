/** Mirrors backend CSV_COLUMNS (src/domain/import.schema.ts) for display. */
export const CSV_HEADER =
  'subjectSlug,topicSlug,language,stem,option1,option2,option3,option4,correctOption,explanation,difficulty,sourceType,sourceYear,sourceExam';

export const CSV_EXAMPLE_ROW =
  'bangla,byakoron,BN,"কোন বানানটি শুদ্ধ?",মুমূর্ষু,মুমুর্ষু,মূমুর্ষু,মুমূর্ষূ,1,"শুদ্ধ বানান মুমূর্ষু।",EASY,PAST_PAPER,2015,৩৫তম বিসিএস';

export const CSV_MAX_BYTES = 2 * 1024 * 1024;

export type CsvPhase = 'idle' | 'uploading' | 'done';

export type AiPhase = 'idle' | 'loading' | 'done' | 'unavailable' | 'error';
