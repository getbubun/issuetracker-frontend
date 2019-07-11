import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  url = environment.baseUrl + "api/v1";

  constructor(private http: HttpClient) { }

  addWatcher(issueId: string, userId: string, authToken: string): Observable<any> {
    var params = new HttpParams()
      .set('issueId', issueId)
      .set('userId', userId)
      .set('authToken', authToken)
    return this.http.post(`${this.url}/watch`, params);
  }
  getWatchers(issueId: string, skip: number, authToken: string): Observable<any> {
    return this.http.get(`${this.url}/watch/get/issueId/${issueId}?skip=${skip}&authToken=${authToken}`);
  }
  getIssue(issueId: string, authToken: string): Observable<any> {
    return this.http.get(`${this.url}/issues/view/${issueId}?authToken=${authToken}`);
  }

  getComment(issueId: string, skip: number, authToken: string): Observable<any> {
    var d = `${this.url}/comments/get/issueId/${issueId}?skip=${skip}&authToken=${authToken}`;
    return this.http.get(d);
  }

  deletePhoto(issueId: string, photo: string, authToken: string): Observable<any> {
    const httpParam = new HttpParams()
      .set('issueId', issueId)
      .set('photo', photo)
      .set('authToken', authToken);
    return this.http.delete(`${this.url}/issues/delete/photo`, { 'params': httpParam });
  };//end of deletePhoto

  //post comment
  postComment(data: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('issueId', data.issueId)
      .set('description', data.description)
      .set('createdBy', data.createdBy)
      .set('authToken', data.authToken)

    return this.http.post(`${this.url}/comments`, httpParams);
  }

  //get all count for dashboard
  getCount(data: any): Observable<any> {
    return this.http.get(`${this.url}/issues/get/count?id=${data.id}&authToken=${data.authToken}`);
  }
  //Update issue
  updateIssue(data): Observable<any> {
    const params = new HttpParams()
      .set('title', data.title)
      .set('description', data.description)
      .set('assignedTo', data.assignedTo)

      .set('status', data.status)
      .set('modifiedBy', data.modifiedBy)
      .set('authToken', data.authToken);
    return this.http.put(`${this.url}/issues/${data.issueId}`, params);
  };
}
