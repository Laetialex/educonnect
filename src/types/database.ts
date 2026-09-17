export type Role = "eleve" | "professeur";

export type Profile = {
  id: string;
  role: Role;
  name: string | null;
  level: string | null;
  subjects: string[] | null;
  profession: string | null;
  problems: string | null;
  availability: string | null;
};

export type Conversation = {
  id: string;
  user1_id: string;
  user2_id: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export type AppointmentStatus = "en_attente" | "accepte" | "refuse";

export type Appointment = {
  id: string;
  student_id: string;
  prof_id: string;
  date: string;
  time: string;
  subject: string;
  message: string | null;
  status: AppointmentStatus | string;
  created_at: string;
};

export type Rating = {
  id: string;
  prof_id: string;
  student_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; role: Role };
        Update: Partial<Profile>;
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation>;
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message>;
        Update: Partial<Message>;
      };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment>;
        Update: Partial<Appointment>;
      };
      ratings: {
        Row: Rating;
        Insert: Partial<Rating>;
        Update: Partial<Rating>;
      };
    };
  };
};
