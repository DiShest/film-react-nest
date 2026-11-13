import { Schema } from 'mongoose';

export interface SessionDocument {
  id: string;
  daytime: string;
  hall: string | number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export interface FilmDocument {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  schedule: SessionDocument[];
}

const sessionSchema = new Schema<SessionDocument>(
  {
    id: { type: String, required: true },
    daytime: { type: String, required: true },
    hall: { type: Schema.Types.Mixed, required: true },
    rows: { type: Number, required: true },
    seats: { type: Number, required: true },
    price: { type: Number, required: true },
    taken: { type: [String], default: [] },
  },
  { _id: false, id: false },
);

export const filmSchema = new Schema<FilmDocument>(
  {
    id: { type: String, required: true, unique: true },
    rating: { type: Number, required: true },
    director: { type: String, required: true },
    tags: { type: [String], default: [] },
    image: { type: String, required: true },
    cover: { type: String, required: true },
    title: { type: String, required: true },
    about: { type: String, required: true },
    description: { type: String, required: true },
    schedule: { type: [sessionSchema], default: [] },
  },
  { collection: 'films', id: false, versionKey: false },
);
