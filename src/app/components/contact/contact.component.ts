import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule, NgForm } from '@angular/forms';
import AOS from 'aos';


@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    from_name: '',
    from_email: '',
    message: ''
  };

  isSending = false;
  isSent = false;
  errorMessage = '';

  sendEmail(form: NgForm) {
    if (!form.valid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSending = true;
    this.isSent = false;
    this.errorMessage = '';

    emailjs
      .send(
        'service_upu8s6u', // 🔹 replace with your Service ID
        'template_p229d9f', // 🔹 replace with your Template ID
        this.formData,
        'SpPfPhpfLGQMERcsQ'  // 🔹 replace with your Public Key
      )
      .then((response: EmailJSResponseStatus) => {
        console.log('SUCCESS!', response.status, response.text);
        this.isSending = false;
        this.isSent = true;
        form.resetForm();
      })
      .catch((err) => {
        console.error('FAILED...', err);
        this.isSending = false;
        this.errorMessage = 'Something went wrong. Please try again later.';
      });
  }
}