import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedService/shared.service';
import { CommentRequest } from '../../model/dto/commentDTO/commentRequest.model';
import { CommentResponse } from '../../model/dto/commentDTO/commentResponse.model';


@Injectable({
  providedIn: 'root'
})

export class CommentService {

  private readonly commentUrl: string;

  constructor(
    private sharedService: SharedService,
    private http: HttpClient
  ) {
    this.commentUrl = this.sharedService.publicUrl + '/comments';
  }

  //Get all comments for a review
  getCommentsByReviewId(reviewId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(
      `${this.commentUrl}/review/${reviewId}`
    );
  }

  //Create comment
  createComment(reviewId: number, request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(
      `${this.commentUrl}/review/${reviewId}`,
      request
    );
  }

  //Reply to comment
  replyToComment(parentCommentId: number, request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(
      `${this.commentUrl}/reply/${parentCommentId}`,
      request
    );
  }

  //Delete comment
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.commentUrl}/${commentId}`
    );
  }

  //Create a comment as a company
  createCommentAsCompany(reviewId: number, request: CommentRequest): Observable<CommentResponse> {
        return this.http.post<CommentResponse>(
      `${this.commentUrl}/c/review/${reviewId}`,
      request
    );
  }

  //Reply to comment as a company
  replyToCommentAsCompany(parentCommentId: number, request: CommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(
      `${this.commentUrl}/c/reply/${parentCommentId}`,
      request
    );
  }

}