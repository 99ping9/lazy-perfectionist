export interface NanoTask {
    id: string;
    text: string;
    isCompleted: boolean;
    isFirstStep?: boolean;
}

export const generateNanoTasks = async (goal: string, dday: Date): Promise<NanoTask[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log(`Generating tasks for goal: ${goal} by ${dday.toDateString()}`);

    // Mock response based on the prompt logic
    return [
        {
            id: "1",
            text: "책상 앞에 앉기",
            isCompleted: false,
            isFirstStep: true,
        },
        {
            id: "2",
            text: "노트북 또는 노트 펼치기",
            isCompleted: false,
        },
        {
            id: "3",
            text: "목표를 위한 첫 번째 키워드 검색하기",
            isCompleted: false,
        },
        {
            id: "4",
            text: "검색 결과 3개 훑어보기",
            isCompleted: false,
        },
        {
            id: "5",
            text: "관련 파일 폴더 생성하기",
            isCompleted: false,
        },
        {
            id: "6",
            text: "5분간 타이머 맞추고 브레인스토밍 하기",
            isCompleted: false,
        }
    ];
};
