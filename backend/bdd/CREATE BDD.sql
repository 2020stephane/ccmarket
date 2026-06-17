CREATE TABLE utilisateurs(
   utilisateur_id INT AUTO_INCREMENT,
   nom VARCHAR(50) NOT NULL,
   prenom VARCHAR(50) NOT NULL,
   email VARCHAR(100) NOT NULL,
   motdepasse VARCHAR(255),
   administrateur BOOLEAN,
   PRIMARY KEY(utilisateur_id),
   UNIQUE(email)
);

CREATE TABLE categories(
   categorie_id INT AUTO_INCREMENT,
   nom VARCHAR(50),
   PRIMARY KEY(categorie_id)
);

CREATE TABLE annonces(
   annonce_id INT AUTO_INCREMENT,
   titre VARCHAR(50),
   descriptif TEXT,
   prix INT,
   date_publication DATE NOT NULL,
   utilisateur_id INT NOT NULL,
   categorie_id INT NOT NULL,
   PRIMARY KEY(annonce_id),
   FOREIGN KEY(utilisateur_id) REFERENCES utilisateurs(utilisateur_id),
   FOREIGN KEY(categorie_id) REFERENCES categories(categorie_id)
);

CREATE TABLE messages(
   message_id INT AUTO_INCREMENT,
   contenu TEXT NOT NULL,
   date_envoi DATE DEFAULT CURRENT_DATE,
   annonce_id INT,
   PRIMARY KEY(message_id),
   FOREIGN KEY(annonce_id) REFERENCES annonces(annonce_id)
);

CREATE TABLE photos(
   photo_id INT AUTO_INCREMENT,
   photo_url VARCHAR(255),
   annonce_id INT NOT NULL,
   PRIMARY KEY(photo_id),
   FOREIGN KEY(annonce_id) REFERENCES annonces(annonce_id)
);

CREATE TABLE envoyer(
   utilisateur_id INT,
   message_id INT,
   PRIMARY KEY(utilisateur_id, message_id),
   FOREIGN KEY(utilisateur_id) REFERENCES utilisateurs(utilisateur_id),
   FOREIGN KEY(message_id) REFERENCES messages(message_id)
);

CREATE TABLE recevoir(
   utilisateur_id INT,
   message_id INT,
   PRIMARY KEY(utilisateur_id, message_id),
   FOREIGN KEY(utilisateur_id) REFERENCES utilisateurs(utilisateur_id),
   FOREIGN KEY(message_id) REFERENCES messages(message_id)
);
