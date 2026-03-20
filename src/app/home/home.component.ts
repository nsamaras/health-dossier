import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Router} from '@angular/router';
import { AuthService } from "../auth/auth.service";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    isLoggedIn: boolean = false;

    titleText : string = 'Ξεκίνα να χρησιμοποιείς online την εφαρμογή αρχείων τεκμηρίωσης για την επιχείρησή σου!';

    descriptionText : string = `Ο υπεύθυνος της επιχείρησης έχει την ευθύνη για την συστηματική – καθημερινή ενημέρωση των αρχείων τεκμηρίωσης. 
    Κάποια από τα έντυπα των αρχείων ενδεχομένως να χρειάζεται να ενημερωθούν παραπάνω από μια φορά την ημέρα, ενώ άλλα μπορεί
    να ενημερώνονται περιστασιακά. Πέραν της τήρησης απλώς της κείμενης νομοθεσίας, σε αυτή την υποχρέωση εμπεριέχονται ουσιώδη στοιχεία 
    που σχετίζονται με την Υγιεινή & Ασφάλεια των Τροφίμων, επομένως σχετίζονται ΑΜΕΣΑ με:`;

    items: string[] = ['Την ασφάλεια των τροφίμων που προσφέρει η επιχείρηση στους καταναλωτές', 
                        'Την υγεία των καταναλωτών', 
                        'Τη ΔΗΜΟΣΙΑ ΥΓΕΙΑ'];

    constructor(private router: Router, private authService: AuthService) {
    }

    ngOnInit() {
      // Subscribe to the authentication state
      this.authService.isAuthenticated().subscribe(isAuth => {
        this.isLoggedIn = isAuth;
      });
    }

    insertLineBreaks(text: string, wordCount: number): string {
      const words = text.split(' ');
      let result = '';
  
      for (let i = 0; i < words.length; i++) {
        result += words[i] + ' ';
        if ((i + 1) % wordCount === 0) {
          result += '<br>';
        }
      }  
      return result.trim();
    }

}
