import Cookie from "./cookie.js";
import { create2DArray } from "./utils.js";

/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
export default class Grille {
  cookieSelectionnes = [];
  /**
   * Constructeur de la grille
   * @param {number} l nombre de lignes
   * @param {number} c nombre de colonnes
   */
  constructor(l, c) {
    this.c = c;
    this.l = l;

    this.tabcookies = this.remplirTableauDeCookies(6)
  }

  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      // on calcule la ligne et la colonne de la case
      // index est le numéro de la case dans la grille
      // on sait que chaque ligne contient this.c colonnes
      // er this.l lignes
      // on peut en déduire la ligne et la colonne
      // par exemple si on a 9 cases par ligne et qu'on 
      // est à l'index 4
      // on est sur la ligne 0 (car 4/9 = 0) et 
      // la colonne 4 (car 4%9 = 4)
      let ligne = Math.floor(index / this.l);
      let colonne = index % this.c;

      console.log("On remplit le div index=" + index + " l=" + ligne + " col=" + colonne);

      // on récupère le cookie correspondant à cette case
      let cookie = this.tabcookies[ligne][colonne];
      // on récupère l'image correspondante
      let img = cookie.htmlImage;

      img.onclick = (event) => {

        console.log("On a cliqué sur la ligne " + ligne + " et la colonne " + colonne);
        //let cookieCliquee = this.getCookieFromLC(ligne, colonne);
        console.log("Le cookie cliqué est de type " + cookie.type);

      
        if(cookie.isSelectionnee()) {
          cookie.deselectionnee();
          
          this.cookieSelectionnes = [];
          return;
        }

        // highlight + changer classe CSS
        cookie.selectionnee();

      if(this.cookieSelectionnes.length === 0){

        this.cookieSelectionnes.push(cookie);
      }
      else if(this.cookieSelectionnes.length === 1){

        const premierCookie = this.cookieSelectionnes[0];

        const swapReussi = Cookie.swapCookies(premierCookie,cookie);

        if(swapReussi){
          console.log("swap reussi!");

          this.reinitialiserMarqueurs();
          this.detecterMatch3Lignes();
          this.detecterMatch3Colonnes();


          let nbDetectees = this.supprimerCookiesDetectees();
          
          if (nbDetectees > 0) {
              console.log(`${nbDetectees} cookies à supprimer !`);
              // TODO 
       }

        }
        else{
          console.log("swap impossible")
      
        }

        premierCookie.deselectionnee();
        cookie.deselectionnee();

        this.cookieSelectionnes = [];
      }

    };
      
      // on affiche l'image dans le div pour la faire apparaitre à l'écran.
      div.appendChild(img);
    });
  }

  // inutile ?
  getCookieFromLC(ligne, colonne) {
    return this.tabcookies[ligne][colonne];
  }

  /**
   * Initialisation du niveau de départ. Le paramètre est le nombre de cookies différents
   * dans la grille. 4 types (4 couleurs) = facile de trouver des possibilités de faire
   * des groupes de 3. 5 = niveau moyen, 6 = niveau difficile
   *
   * Améliorations : 1) s'assurer que dans la grille générée il n'y a pas déjà de groupes
   * de trois. 2) S'assurer qu'il y a au moins 1 possibilité de faire un groupe de 3 sinon
   * on a perdu d'entrée. 3) réfléchir à des stratégies pour générer des niveaux plus ou moins
   * difficiles.
   *
   * On verra plus tard pour les améliorations...
   */
  remplirTableauDeCookies(nbDeCookiesDifferents) {
    // créer un tableau vide de 9 cases pour une ligne
    // en JavaScript on ne sait pas créer de matrices
    // d'un coup. Pas de new tab[3][4] par exemple.
    // Il faut créer un tableau vide et ensuite remplir
    // chaque case avec un autre tableau vide
    // Faites ctrl-click sur la fonction create2DArray
    // pour voir comment elle fonctionne
    let tab = create2DArray(9);

    // remplir
    for (let l = 0; l < this.l; l++) {
      for (let c = 0; c < this.c; c++) {

        // on génère un nombre aléatoire entre 0 et nbDeCookiesDifferents-1
        const type = Math.floor(Math.random() * nbDeCookiesDifferents);
        //console.log(type)
        tab[l][c] = new Cookie(type, l, c);
      }
    }

    return tab;
  }

  detecterMatch3Lignes(){

    console.log("détection des alignements horizontaux");

    for(let ligne=0; ligne< this.l; ligne++){

      let compteur= 1;
      let typeCourant= this.tabcookies[ligne][0].type;

      for(let col=1; col< this.c; col++){

        let cookie = this.tabcookies[ligne][col];

        if(cookie.type === typeCourant){

          compteur++;
        }
        else{

          if(compteur >= 3){

            for(let i= col- compteur; i < col; i++){

              this.tabcookies[ligne][i].aSupprimer= true;
            }

          }

          compteur= 1;
          typeCourant= cookie.type;
        }
      }

      if(compteur >= 3){

        for(let i= this.c- compteur; i < this.c; i++){

          this.tabcookies[ligne][i].aSupprimer= true;
        }
      }
    }
  }


  detecterMatch3Colonnes(){


    console.log("detecter les alignements en colonnes");

    for(let col= 0; col < this.c; col++) {

      let compteur= 1;
      let typeCourant= this.tabcookies[0][col].type;

    
      for(let ligne= 1; ligne< this.l; ligne++){

        let cookie= this.tabcookies[ligne][col];

        if(cookie.type === typeCourant){
          compteur++;
        }

      else{
        if(compteur >= 3){

          for(let i= ligne- compteur; i < ligne; i++){

            this.tabcookies[i][col].aSupprimer= true;
          }
        }

        compteur= 1;
        typeCourant= cookie.type;
      }


    }

    if(compteur >= 3){

      for(let i= this.l- compteur; i < this.l; i++){

        this.tabcookies[i][col].aSupprimer= true;
      }
    }

  }

  }


  reinitialiserMarqueurs(){


    for(let l= 0; l < this.l; l++){

      for(let c=0; c < this.c; c++){
        this.tabcookies[l][c].aSupprimer= false;
      }
    }



  }

  supprimerCookiesDetectees(){

    let nbCookies= 0;

    for(let l= 0; l< this.l; l++){

      for(let c= 0; c < this.c; c++){

        let cookie= this.tabcookies[l][c];

        if(cookie.aSupprimer){

          cookie.disparaitre();
          nbCookies++;
        }
      }
    }

    console.log(`${nbCookies} cookies à supprimer détectées`);
    return nbCookies;

  }


  creerNouveauCookie(ligne, col){

    const type= Math.floor(Math.random() *6);
    const newCookie= new Cookie(type,ligne,col);

    this.tabcookies[ligne][col]= newCookie;

    let caseDivs= document.querySelectorAll("#grillediv"); //remplace dans le dom
    let index= ligne*this.c+ col;
    let div= caseDivs[index];

    div.innerHTML= '';
    div.appendChild(newCookie.htmlImage); //l'image du cookie que l'on remplace

    //comme dans showCookies
    newCookie.htmlImage.onclick= (event)=> {
      this.gererClicCookie(newCookie);
    };

    return newCookie;
  }


  gererClicCookie(cookie){

    console.log("j'ai cliqué sur la ligne "+ cookie.ligne + " et sur la colonne " + cookie.colonne);

    if(cookie.isSelectionnee()) {

      cookie.deselectionnee();
      this.cookieSelectionnes= []

      return;
    }

    cookie.selectionnee();

    if(this.cookieSelectionnes.length === 0){

      this.cookieSelectionnes.push(cookie);
    }

    else if(this.cookieSelectionnes.length === 1){
      const premierCookie= this.cookieSelectionnes[0];
      const swapReussi= Cookie.swapCookies(premierCookie,cookie);

      if(swapReussi){
        console.log("swap reussi");
        this.traiterApresSwap();
      }

      else{
        console.log("swap impossible");
      }

      premierCookie.deselectionnee();
      cookie.deselectionnee();
      this.cookieSelectionnes= [];
    }


  }



  traiterApresSwap(){


    let continuer= true;

    while(continuer){

      // on detecte d'abord les alignements
      
      this.reinitialiserMarqueurs();
      this.detecterMatch3Lignes();
      this.detecterMatch3Colonnes();


      let nbDetectees= this.supprimerCookiesDetectees();

      if(nbDetectees === 0){

        continuer= false;
      }
      else{
        this.gererChutesToutesColonnes(); //il faut gérer les chutes + continuer detection alignements
      
      }
    }
  }

}
