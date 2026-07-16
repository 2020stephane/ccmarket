-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 16 juil. 2026 à 16:21
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ccmarket`
--

-- --------------------------------------------------------

--
-- Structure de la table `adresses`
--

CREATE TABLE `adresses` (
  `adresse_id` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `complement` varchar(50) DEFAULT NULL,
  `rue` varchar(100) NOT NULL,
  `code_postal_id` int(11) NOT NULL,
  `ville_id` int(11) NOT NULL,
  `pays_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `adresses`
--

INSERT INTO `adresses` (`adresse_id`, `numero`, `complement`, `rue`, `code_postal_id`, `ville_id`, `pays_id`) VALUES
(1, 12, NULL, 'Rue des Oliviers', 1, 1, 1),
(2, 45, 'Appartement 3', 'Avenue Jean Jaurès', 2, 2, 1),
(3, 8, NULL, 'Rue Sainte-Catherine', 3, 3, 1),
(4, 23, 'Résidence Le Parc', 'Boulevard de la Loire', 4, 4, 1),
(5, 67, NULL, 'Rue de la République', 5, 5, 1);

-- --------------------------------------------------------

--
-- Structure de la table `annonces`
--

CREATE TABLE `annonces` (
  `annonce_id` int(11) NOT NULL,
  `titre` varchar(100) NOT NULL,
  `descriptif` text DEFAULT NULL,
  `prix` decimal(10,2) NOT NULL,
  `date_publication` date NOT NULL DEFAULT current_timestamp(),
  `adresse_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `categorie_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonces`
--

INSERT INTO `annonces` (`annonce_id`, `titre`, `descriptif`, `prix`, `date_publication`, `adresse_id`, `utilisateur_id`, `categorie_id`) VALUES
(3, 'Panneau solaire 200W', 'Panneau solaire rigide 200W, utilisé 1 saison, excellent état, avec câbles inclus.', 160.00, '2026-07-16', 1, 3, 2),
(4, 'Frigo à compression Dometic 50L', 'Réfrigérateur à compression 50L, fonctionne parfaitement, vendu car upgrade.', 350.00, '2026-07-16', 1, 2, 3),
(5, 'Barbecue gaz portable Weber', 'Barbecue gaz 2 brûleurs Weber Q1200, utilisé 2 étés, très bon état.', 95.00, '2026-07-16', 1, 2, 7);

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `categorie_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`categorie_id`, `nom`) VALUES
(3, 'Cuisine & Électroménager'),
(6, 'Électronique & Navigation'),
(2, 'Énergie solaire'),
(7, 'Extérieur & Auvent'),
(5, 'Literie & Confort'),
(1, 'Mobilier intérieur'),
(4, 'Sanitaire & Eau');

-- --------------------------------------------------------

--
-- Structure de la table `code_postal`
--

CREATE TABLE `code_postal` (
  `code_postal_id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `code_postal`
--

INSERT INTO `code_postal` (`code_postal_id`, `code`) VALUES
(1, '34000'),
(2, '69001'),
(3, '33000'),
(4, '44000'),
(5, '59000');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `date_envoi` datetime NOT NULL DEFAULT current_timestamp(),
  `moderation_id` int(11) DEFAULT NULL,
  `annonce_id` int(11) NOT NULL,
  `expediteur_id` int(11) NOT NULL,
  `destinataire_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`message_id`, `contenu`, `date_envoi`, `moderation_id`, `annonce_id`, `expediteur_id`, `destinataire_id`) VALUES
(1, 'Bonjour, le panneau est-il toujours dispo ?', '2026-07-16 16:19:08', 1, 3, 2, 3);

-- --------------------------------------------------------

--
-- Structure de la table `moderations`
--

CREATE TABLE `moderations` (
  `moderation_id` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'en_attente',
  `motif` varchar(255) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `moderations`
--

INSERT INTO `moderations` (`moderation_id`, `status`, `motif`, `date`) VALUES
(1, 'en attente', NULL, '2026-07-16 16:19:08');

-- --------------------------------------------------------

--
-- Structure de la table `pays`
--

CREATE TABLE `pays` (
  `pays_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `code_iso` char(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pays`
--

INSERT INTO `pays` (`pays_id`, `nom`, `code_iso`) VALUES
(1, 'France', 'FR'),
(2, 'Belgique', 'BE'),
(3, 'Suisse', 'CH'),
(4, 'Luxembourg', 'LU');

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

CREATE TABLE `photos` (
  `photo_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `annonce_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `photos`
--

INSERT INTO `photos` (`photo_id`, `photo_url`, `annonce_id`) VALUES
(1, '1784210926603_jwt6yy.webp', 3),
(2, '1784211208569_ajg45b.webp', 4),
(3, '1784211268685_rtngt7.webp', 5);

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `nom` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`role_id`, `nom`) VALUES
(1, 'administrateur'),
(3, 'invite'),
(2, 'moderateur');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `utilisateur_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `motdepasse` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL DEFAULT 3,
  `avatar_url` varchar(255) DEFAULT NULL,
  `date_inscription` datetime NOT NULL DEFAULT current_timestamp(),
  `methode_auth` enum('local','google') NOT NULL DEFAULT 'local'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`utilisateur_id`, `nom`, `prenom`, `email`, `motdepasse`, `role_id`, `avatar_url`, `date_inscription`, `methode_auth`) VALUES
(1, 'brisse', 'stephane', 'stephanebrisse@gmail.com', NULL, 1, '1784192301215.webp', '2026-07-16 10:21:03', 'google'),
(2, 'martin', 'sophie', 'sophiemartin@email.com', '$2b$10$Lv04QGVx/8CujEoBNm/YA.myzzUqrTKX6XmGVizCx7RRSd509WXkq', 3, '1784204305308.webp', '2026-07-16 14:18:06', 'local'),
(3, 'durand', 'isabelle', 'isabelledurand@email.com', '$2b$10$f0B6JeDEcjwKSn3LxmNo9ud52mLLQLjWo3GlX6c4Lz//h7aEpVEY.', 3, '1784204411250.webp', '2026-07-16 14:19:36', 'local');

-- --------------------------------------------------------

--
-- Structure de la table `villes`
--

CREATE TABLE `villes` (
  `ville_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `pays_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `villes`
--

INSERT INTO `villes` (`ville_id`, `nom`, `pays_id`) VALUES
(1, 'Montpellier', 1),
(2, 'Lyon', 1),
(3, 'Bordeaux', 1),
(4, 'Nantes', 1),
(5, 'Lille', 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `adresses`
--
ALTER TABLE `adresses`
  ADD PRIMARY KEY (`adresse_id`),
  ADD KEY `ville_id` (`ville_id`),
  ADD KEY `pays_id` (`pays_id`),
  ADD KEY `code_postal_id` (`code_postal_id`);

--
-- Index pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD PRIMARY KEY (`annonce_id`),
  ADD KEY `adresse_id` (`adresse_id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `categorie_id` (`categorie_id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categorie_id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `code_postal`
--
ALTER TABLE `code_postal`
  ADD PRIMARY KEY (`code_postal_id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD UNIQUE KEY `moderation_id` (`moderation_id`),
  ADD KEY `annonce_id` (`annonce_id`),
  ADD KEY `expediteur_id` (`expediteur_id`),
  ADD KEY `destinataire_id` (`destinataire_id`);

--
-- Index pour la table `moderations`
--
ALTER TABLE `moderations`
  ADD PRIMARY KEY (`moderation_id`);

--
-- Index pour la table `pays`
--
ALTER TABLE `pays`
  ADD PRIMARY KEY (`pays_id`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD UNIQUE KEY `code_iso` (`code_iso`);

--
-- Index pour la table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `annonce_id` (`annonce_id`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`utilisateur_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Index pour la table `villes`
--
ALTER TABLE `villes`
  ADD PRIMARY KEY (`ville_id`),
  ADD KEY `pays_id` (`pays_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `adresses`
--
ALTER TABLE `adresses`
  MODIFY `adresse_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `annonces`
--
ALTER TABLE `annonces`
  MODIFY `annonce_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `categorie_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `code_postal`
--
ALTER TABLE `code_postal`
  MODIFY `code_postal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `moderations`
--
ALTER TABLE `moderations`
  MODIFY `moderation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `pays`
--
ALTER TABLE `pays`
  MODIFY `pays_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `photo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `utilisateur_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `villes`
--
ALTER TABLE `villes`
  MODIFY `ville_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `adresses`
--
ALTER TABLE `adresses`
  ADD CONSTRAINT `adresses_ibfk_1` FOREIGN KEY (`ville_id`) REFERENCES `villes` (`ville_id`),
  ADD CONSTRAINT `adresses_ibfk_2` FOREIGN KEY (`pays_id`) REFERENCES `pays` (`pays_id`),
  ADD CONSTRAINT `adresses_ibfk_3` FOREIGN KEY (`code_postal_id`) REFERENCES `code_postal` (`code_postal_id`);

--
-- Contraintes pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD CONSTRAINT `annonces_ibfk_1` FOREIGN KEY (`adresse_id`) REFERENCES `adresses` (`adresse_id`),
  ADD CONSTRAINT `annonces_ibfk_2` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`utilisateur_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `annonces_ibfk_3` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`categorie_id`);

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`moderation_id`) REFERENCES `moderations` (`moderation_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`annonce_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`expediteur_id`) REFERENCES `utilisateurs` (`utilisateur_id`),
  ADD CONSTRAINT `messages_ibfk_4` FOREIGN KEY (`destinataire_id`) REFERENCES `utilisateurs` (`utilisateur_id`);

--
-- Contraintes pour la table `photos`
--
ALTER TABLE `photos`
  ADD CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`annonce_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Contraintes pour la table `villes`
--
ALTER TABLE `villes`
  ADD CONSTRAINT `villes_ibfk_1` FOREIGN KEY (`pays_id`) REFERENCES `pays` (`pays_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
