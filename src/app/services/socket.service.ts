import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {


  private url = `${environment.baseUrl}chat`;

  private socket;
  private authToken;

  constructor() {
    this.socket = io(this.url);
  }



  /*
    events to be listened
  */
  public verifyUser = () => {
    return Observable.create((observer: any) => {
      this.socket.on('verifyUser', (data: any) => {
        observer.next(data);
      }); //end socket
    }); //end Observable
  }


  public registerForUserUpdatedNotifications = () => {
    this.socket.removeAllListeners("user-updated-data");
    return Observable.create((observer) => {
      this.socket.on('user-updated-data', (data) => {
        observer.next(data);
      }); //end Socket
    }); //end Observable
  };//end of register for comment notification


  public registerForCommentNotification = () => {
    this.socket.removeAllListeners("comment-posted-notification");
    return Observable.create((observer) => {
      this.socket.on('comment-posted-notification', (data) => {
        observer.next(data);
      }); //end Socket
    }); //end Observable
  };//end of register for comment notification

  public registerForNotification = () => {
    this.socket.removeAllListeners("issue-updated-data");
    return Observable.create((observer) => {
      this.socket.on('issue-updated-data', (data) => {
        observer.next(data);
      }); //end Socket
    }); //end Observable
  }; //end of registerForNotification

  public registerForNewIssueCreated = () => {
    this.socket.removeAllListeners("new-issue-created");
    return Observable.create((observer) => {
      this.socket.on('new-issue-created', (data) => {
        observer.next(data);
      }); //end Socket
    }); //end Observable
  }; //end of registerForNotification


  /*
    end of events to be listened
  */


  /*
    events to be emitted
  */

  public updateSubsrcibeUsers = (data) => {
    this.socket.emit('update-user', data);
  }

  public notifyAssignee = (data) => {
    this.socket.emit('notify-assignee', data)
  };//end of notify assignee


  public updateRoom = (data) => {
    this.socket.emit('add-watcher', data)
  } // end of disconnectSocket

  public disconnectedSocket = () => {
    return Observable.create((observer: any) => {
      this.socket.on('disconnect', () => {
        observer.next();
      });//end of socket
    })//end of Observable
  } // end of disconnectSocket

  public updateIssueNotification = (data) => {
    this.socket.emit('update-issue', data);
  }; //end of updateIssueNotification

  public commentNotification = (commentData) => {
    this.socket.emit('comment-post', commentData);
  };//end of commentNotification

  public setUser = (apiKey) => {
    this.socket.emit("set-user", apiKey);
  } //end of setUser


  /*
    end of events to be emitted
  */

}