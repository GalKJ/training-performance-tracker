export type Wod = {
  slug: string;
  date: string;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  bodyHtml: string;
  bodyText: string;
  fetchedAt: string;
};

export type SessionBlock = {
  label: string;
  name: string;
  durationMin: number;
  movements: string[];
};

export type SessionPlan = {
  warmUp: SessionBlock;
  wod: SessionBlock;
  accessories: SessionBlock;
  totalMin: number;
};
