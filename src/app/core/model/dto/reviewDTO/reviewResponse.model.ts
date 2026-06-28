import { CommentResponse } from "../commentDTO/commentResponse.model";

export interface ReviewResponse {
  id: number;
  rating: number;
  content: string;
  userName: string;
  isMine?: boolean;
  commentsCount: number;
  previewComment?: CommentResponse;
  createdAt: string;


  // UI ONLY (frontend state)
  showComments?: boolean;
  comments?: CommentResponse[];
  newComment?: string;
  
}
