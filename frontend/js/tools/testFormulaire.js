//===========================================================
//    FICHIER : testFormulaire.js
//    PROJET  : ccmarket
//    DATE    : 23/06/2026
//    AUTEUR  : Stephane Brisse
//===========================================================
export function testFormulaire() {


const idTitre = document.getElementById('titre');
const idCategorie = document.getElementById('categorie');
const idPrix = document.getElementById('prix');
const idDescriptif = document.getElementById('descriptif');
const idPhoto = document.getElementById('photo');

let tempData = {};

if (idTitre.value !== idTitre.defaultValue) {
    tempData.titre = idTitre.value;
}
if (idCategorie.value !== idCategorie.defaultValue) {
    tempData.categorie_id = idCategorie.value;
}
if (idPrix.value !== idPrix.defaultValue) {
    tempData.prix = idPrix.value;
}
if (idDescriptif.value !== idDescriptif.defaultValue) {
    tempData.descriptif = idDescriptif.value;
}
if (idPhoto.value !== idPhoto.defaultValue) {
     console.log("photo= ",idPhoto.value);
    tempData.photo = idPhoto.value;
}
console.log("tempData = ", tempData);
return tempData;
}
