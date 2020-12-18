import { Router } from '@angular/router';
import { PostService } from './../service/post.service';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import {CameraService} from '../camera.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  imagePath = '/assets/cactus.png';
  postForm;

	constructor(private cameraSvc: CameraService, private formBuilder: FormBuilder, private post: PostService, private router: Router) { }

	ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      title: '',
      comments: ''
    });
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl;
	  }
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
  }

  postArticle(formData) {
    const userData: any = JSON.parse(localStorage.getItem('userData'));
    formData['username'] = userData.username;
    formData['password'] = userData.password;
    formData['imageData'] = this.cameraSvc.getImage();
    console.log(formData);
    this.post.postArticle(formData).subscribe((data: any) => {
      console.log(data);
      if (data.status === 200) {
        this.postForm = this.formBuilder.group({
          title: '',
          comments: ''
        });
        this.imagePath = '/assets/cactus.png';
      } else if (data.status === 401) {
        this.router.navigate(['/']);
      } else {
        console.log(data);
      }
    });
  }
}
