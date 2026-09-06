import { useState } from "react";

export type FeedbackTag = "UX" | "Control" | "Scheduling" | "Data" | "Integrations" | "AI/ML" | "Performance";
export const FEEDBACK_TAGS: FeedbackTag[] = ["UX", "Control", "Scheduling", "Data", "Integrations", "AI/ML", "Performance"];

export interface Idea {
  id: number;
  title: string;
  description: string;
  votes: number;
  voted: boolean;
  tag: string;
  author: string;
  date: string;
}

export interface NewIdea {
  title: string;
  description: string;
  tag: FeedbackTag;
  author: string;
  date: string;
}

export interface IdeaRepository {
  list(): Idea[];
  add(idea: NewIdea): Idea;
  toggleVote(id: number): Idea[];
}

const seedIdeas: Idea[] = [
  { id: 1, title: "Per-app manual priority override", description: "Allow users to manually set priority overrides for specific apps that persist across sessions, overriding AI decisions when needed.", votes: 47, voted: false, tag: "Control", author: "M. Torres", date: "Aug 28" },
  { id: 2, title: "Scheduled bandwidth windows", description: "Let users define time windows where certain traffic types (e.g., backups) are automatically allowed full bandwidth — like overnight scheduling.", votes: 38, voted: false, tag: "Scheduling", author: "Y. Nakamura", date: "Sep 1" },
  { id: 3, title: "Dark mode dashboard", description: "Add dark mode support for the web dashboard. Long sessions on bright white are fatiguing, especially for ops engineers.", votes: 31, voted: false, tag: "UX", author: "A. Bergström", date: "Sep 2" },
  { id: 4, title: "Priority decision export (CSV/JSON)", description: "Export historical prioritization decisions with timestamps, scores, and reasons for compliance audits and offline analysis.", votes: 26, voted: false, tag: "Data", author: "P. Okonkwo", date: "Aug 19" },
  { id: 5, title: "Webhook notifications on congestion events", description: "Fire a webhook when congestion is detected or when a prioritization action is taken, enabling integration with PagerDuty and Slack.", votes: 19, voted: false, tag: "Integrations", author: "C. Larsson", date: "Sep 3" },
];

const sortIdeasByVotes = (ideas: Idea[]) => [...ideas].sort((first, second) => second.votes - first.votes);

export class InMemoryIdeaRepository implements IdeaRepository {
  private ideas: Idea[];

  constructor(initialIdeas: Idea[] = seedIdeas) {
    this.ideas = initialIdeas.map(idea => ({ ...idea }));
  }

  list() {
    return sortIdeasByVotes(this.ideas);
  }

  add(idea: NewIdea) {
    const createdIdea: Idea = { ...idea, id: Date.now(), votes: 0, voted: false };
    this.ideas = [createdIdea, ...this.ideas];
    return createdIdea;
  }

  toggleVote(id: number) {
    this.ideas = this.ideas.map(idea =>
      idea.id === id
        ? { ...idea, votes: idea.voted ? idea.votes - 1 : idea.votes + 1, voted: !idea.voted }
        : idea,
    );
    return this.list();
  }
}

export function useIdeas(repository: IdeaRepository) {
  const [ideas, setIdeas] = useState(() => repository.list());

  const vote = (id: number) => setIdeas(repository.toggleVote(id));
  const add = (idea: NewIdea) => {
    const createdIdea = repository.add(idea);
    setIdeas(repository.list());
    return createdIdea;
  };

  return { ideas, vote, add };
}
