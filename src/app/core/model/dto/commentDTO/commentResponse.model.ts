import { ActorType } from "../../enums/actorType.enum.model";

export interface CommentResponse {
  id: number;
  content: string;

  actorName: string;
  actorType: ActorType;
  actorId: number;

  reviewId: number;

   
  repliedToCommentId: number | null;
  repliedToActorId: number | null;
  repliedToActorType: ActorType | null;
  repliedToActorName: string | null;


  isMine: boolean;
  createdAt: string;
}



 
