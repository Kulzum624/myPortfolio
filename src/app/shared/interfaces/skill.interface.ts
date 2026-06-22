export interface Skill {
    id: number;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    icon?: string;
}
