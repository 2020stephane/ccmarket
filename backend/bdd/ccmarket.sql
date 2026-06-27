-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 27 juin 2026 à 13:26
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
-- Structure de la table `annonces`
--

CREATE TABLE `annonces` (
  `annonce_id` int(11) NOT NULL,
  `titre` varchar(50) DEFAULT NULL,
  `descriptif` varchar(50) DEFAULT NULL,
  `prix` int(11) DEFAULT NULL,
  `date_publication` date NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `categorie_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonces`
--

INSERT INTO `annonces` (`annonce_id`, `titre`, `descriptif`, `prix`, `date_publication`, `utilisateur_id`, `categorie_id`) VALUES
(4, NULL, NULL, NULL, 'H762-11-22', -445746144, -798921106),
(6, 'Frigo à compression Dometic 50LRéfrigérateur à compression 50L, fonctionne ', 'parfait', -445815442, 'O254-01-00', -161124764, -182426783),
(8, NULL, NULL, -731815316, 'M328-03-05', -199216096, -479698583),
(9, 'Kit douche solaire 20LDouche solaire portable 20L avec pommeau r', NULL, NULL, '8660-11-07', -329162132, -450092941),
(10, NULL, 'GPS Garmin Camper 890GPS spécial camping car, cartes Europe à j', NULL, 'N650-11-18', -1607323598, -1288953661),
(11, NULL, 'Matelas mémoire de forme 140x190Matelas mémoire de forme 2 places, épaiss', -445287904, 'F681-03-03', -315875224, -277515405),
(12, NULL, NULL, NULL, 'J679-11-13', -261807933, 538994017),
(13, NULL, NULL, -1033801118, 'M361-11-21', -450861215, -98537361),
(14, NULL, NULL, -261132944, 'M328-03-01', -1603968651, -210407323),
(15, 'Panne', 'au solaire 200W Victronsuper�\0\0<��׀\0\0�\0\0n, excellent état, avec câbles inclus.�\0\0���a�\0\0�\0\0es inclus.�', NULL, '@384-05-20', 265314688, -2147483008),
(16, 'Auvent latéral Fiamma F45Panneau solaire rigide 200W, utilisé 1 saison, excellent �', NULL, 695492980, 'F032-03-01', -161127648, -473718174);

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `categorie_id` int(11) NOT NULL,
  `nom` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`categorie_id`, `nom`) VALUES
(1, 'Mobilier intérieur'),
(2, 'Énergie solaire'),
(3, 'Cuisine & Électroménager'),
(4, 'Sanitaire & Eau'),
(5, 'Literie & Confort'),
(6, 'Électronique & Navigation'),
(7, 'Extérieur & Auvent');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `contenu` varchar(50) NOT NULL,
  `date_envoi` date DEFAULT NULL,
  `annonce_id` int(11) DEFAULT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `utilisateur_id_1` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

CREATE TABLE `photos` (
  `photo_id` int(11) NOT NULL,
  `photo_url` varchar(50) DEFAULT NULL,
  `annonce_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `photos`
--

INSERT INTO `photos` (`photo_id`, `photo_url`, `annonce_id`) VALUES
(19, '1782201017165_pompe.webp', 14),
(20, '1782215581230_ps2.webp', 15);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `utilisateur_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `motdepasse` varchar(50) DEFAULT NULL,
  `administrateur` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`utilisateur_id`, `nom`, `prenom`, `email`, `motdepasse`, `administrateur`) VALUES
(1, 'brisse', 'stephane', 'stephanebrisse@gmail.com', '$2b$10$OHZWPMw98aJoOrTCf5OSSuk16XKChbmbU1IKfnRwL451vvvNIgzsG', 1),
(2, 'martin', 'sophie', 'sophiemartin@email.com', '$2b$10$c1auVCK5kZHOPduL70dKAe0pFSRoQ5N.MOYmMUogLwXTqsMuHg24e', 0),
(3, 'dubois', 'pierre', 'pierredubois@email.com', '$2b$10$ODW3bwWIPW2zv4zYbTHG3O0jViYrzvxrAdrPnq2UAYt5g3l8SeXAm', 0),
(4, 'bernard', 'marie', 'mariebernard@email.com', '$2b$10$LEBhJx560Mi7lBI/pzwB1u7pUC1au190rWY1S.2wZ46x9qJrNeAVW', 0),
(5, 'petit', 'jean', 'jeanpetit@email.com', '$2b$10$GVdn/4yuhob7VGuDiY3k6eKowRSgml1aH6AQGXvP6AeO0/dmVNxNa', 0),
(6, 'durand', 'isabelle', 'isabelledurand@email.com', '$2b$10$gAxkGK4dFBamHM7q5JS.l.9ILYAnnQTu9Sz2VQMcKn0MpRUvTC8b.', 0),
(7, 'moreau', 'lucas', 'lucasmoreau@email.com', '$2b$10$Yc96/1x5KdnkgPC9oe.kSOi.yXMBYLbzmy1Jf917.eEICxeCRyxt.', 0),
(8, 'girard', 'francois', 'francoisgirard@email.com', '$2b$10$GOeU725iHzs05jvoY2wTheuoLtInJoW9RfLpPP9zOAivs70.AmHny', 0),
(9, 'laurent', 'nathalie', 'nathalielaurent@email.com', '$2b$10$GdRad1b91fcQIrzThBOSR.bwlNnvRbzObO09ThboTvrFPaNhwhGJi', 0),
(10, 'simon', 'thierry', 'thierrysimon@email.com', '$2b$10$LrUdh3FrJB8Swmq1k3GnCecGMxqEBkcHzDCrQdQfvg8IDXisEOulq', 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD PRIMARY KEY (`annonce_id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `categorie_id` (`categorie_id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categorie_id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `annonce_id` (`annonce_id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `utilisateur_id_1` (`utilisateur_id_1`);

--
-- Index pour la table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`photo_id`),
  ADD KEY `annonce_id` (`annonce_id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`utilisateur_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annonces`
--
ALTER TABLE `annonces`
  MODIFY `annonce_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `categorie_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `photo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `utilisateur_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
