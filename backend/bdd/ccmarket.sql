-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 03 juil. 2026 à 16:04
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
  `descriptif` varchar(150) DEFAULT NULL,
  `prix` int(11) DEFAULT NULL,
  `date_publication` datetime NOT NULL DEFAULT current_timestamp(),
  `utilisateur_id` int(11) NOT NULL,
  `categorie_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonces`
--

INSERT INTO `annonces` (`annonce_id`, `titre`, `descriptif`, `prix`, `date_publication`, `utilisateur_id`, `categorie_id`) VALUES
(11, 'Panneau solaire 200W Victron', 'Panneau solaire rigide 200W, utilisé 1 saison, excellent état, avec câbles inclus.', 180, '2024-03-01 00:00:00', 2, 2),
(12, 'Auvent latéral Fiamma F45', 'Auvent Fiamma F45 de 3m, couleur gris, très bon état, démonté avec soin.', 350, '2024-03-05 00:00:00', 3, 7),
(13, 'Frigo à compression Dometic 50L', 'Réfrigérateur à compression 50L, fonctionne parfaitement, vendu car upgrade.', 220, '2024-03-08 00:00:00', 4, 3),
(14, 'Convertisseur 12V/230V 1000W', 'Convertisseur pur sinus 1000W, marque Victron, peu utilisé, avec notice.', 150, '2024-03-10 00:00:00', 2, 2),
(15, 'Table et 4 chaises pliantes', 'Ensemble table aluminium + 4 chaises légères, idéal camping car, bon état.', 85, '2024-03-12 00:00:00', 5, 1),
(16, 'Kit douche solaire 20L', 'Douche solaire portable 20L avec pommeau réglable, saison 2023.', 25, '2024-03-15 00:00:00', 3, 4),
(17, 'GPS Garmin Camper 890', 'GPS spécial camping car, cartes Europe à jour 2023, état neuf.', 280, '2024-03-18 00:00:00', 4, 6),
(18, 'Matelas mémoire de forme 140x190', 'Matelas mémoire de forme 2 places, épaisseur 12cm, housse lavable incluse.', 120, '2024-03-20 00:00:00', 5, 5),
(20, 'Barbecue gaz portable Weber', 'Barbecue gaz 2 brûleurs Weber Q1200, utilisé 2 étés, très bon état.', 95, '2024-03-25 00:00:00', 3, 7),
(25, 'convertisseur', 'super etat', 35, '2026-06-28 15:49:50', 1, 2),
(26, 'barbecue auchan', 'tres bien', 75, '2026-06-29 09:10:14', 1, 7);

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
-- Structure de la table `contacts`
--

CREATE TABLE `contacts` (
  `contact_id` int(11) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` varchar(250) NOT NULL,
  `date_envoi` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `contacts`
--

INSERT INTO `contacts` (`contact_id`, `prenom`, `nom`, `email`, `message`, `date_envoi`) VALUES
(3, 'titi', 'titi', 'titi@gmail.com', 'test', '2026-06-30 16:08:18'),
(4, 'toto', 'toto', 'toto@gmail.com', 'test', '2026-07-03 13:32:07');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `contenu` varchar(50) NOT NULL,
  `date_envoi` date DEFAULT NULL,
  `annonce_id` int(11) DEFAULT NULL,
  `expediteur_id` int(11) NOT NULL,
  `destinataire_id` int(11) NOT NULL
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
(1, '1782648232143_victron.webp', 21),
(2, '1782648456138_victron.webp', 22),
(3, '1782653806045_victron.webp', 23),
(4, '1782654425450_victron.webp', 24),
(5, '1782654590482_victron.webp', 25),
(19, '1782201017165_pompe.webp', 14),
(20, '1782215581230_ps2.webp', 15),
(21, '1782717014627_barbecue1.webp', 26),
(22, '1782728436186_ps1.webp', 27),
(23, '1782742257590_ps2.webp', 28),
(24, '1782742674405_ps2.webp', 29),
(25, '1782743017771_ps2.webp', 30),
(26, '1783077492655_ps2.webp', 31);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `utilisateur_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `motdepasse` varchar(255) DEFAULT NULL,
  `administrateur` tinyint(1) DEFAULT NULL,
  `date_inscription` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`utilisateur_id`, `nom`, `prenom`, `email`, `motdepasse`, `administrateur`, `date_inscription`) VALUES
(1, 'brisse', 'stephane', 'stephanebrisse@gmail.com', '$2b$10$OHZWPMw98aJoOrTCf5OSSuk16XKChbmbU1IKfnRwL451vvvNIgzsG', 1, '2026-06-28 08:37:54'),
(2, 'martin', 'sophie', 'sophiemartin@email.com', '$2b$10$c1auVCK5kZHOPduL70dKAe0pFSRoQ5N.MOYmMUogLwXTqsMuHg24e', 0, '2026-06-28 08:37:54'),
(3, 'dubois', 'pierre', 'pierredubois@email.com', '$2b$10$ODW3bwWIPW2zv4zYbTHG3O0jViYrzvxrAdrPnq2UAYt5g3l8SeXAm', 0, '2026-06-28 08:37:54'),
(4, 'bernard', 'marie', 'mariebernard@email.com', '$2b$10$LEBhJx560Mi7lBI/pzwB1u7pUC1au190rWY1S.2wZ46x9qJrNeAVW', 0, '2026-06-28 08:37:54'),
(5, 'petit', 'jean', 'jeanpetit@email.com', '$2b$10$GVdn/4yuhob7VGuDiY3k6eKowRSgml1aH6AQGXvP6AeO0/dmVNxNa', 0, '2026-06-28 08:37:54'),
(6, 'durand', 'isabelle', 'isabelledurand@email.com', '$2b$10$gAxkGK4dFBamHM7q5JS.l.9ILYAnnQTu9Sz2VQMcKn0MpRUvTC8b.', 0, '2026-06-28 08:37:54'),
(7, 'moreau', 'lucas', 'lucasmoreau@email.com', '$2b$10$Yc96/1x5KdnkgPC9oe.kSOi.yXMBYLbzmy1Jf917.eEICxeCRyxt.', 0, '2026-06-28 08:37:54'),
(8, 'girard', 'francois', 'francoisgirard@email.com', '$2b$10$GOeU725iHzs05jvoY2wTheuoLtInJoW9RfLpPP9zOAivs70.AmHny', 0, '2026-06-28 08:37:54'),
(9, 'laurent', 'nathalie', 'nathalielaurent@email.com', '$2b$10$GdRad1b91fcQIrzThBOSR.bwlNnvRbzObO09ThboTvrFPaNhwhGJi', 0, '2026-06-28 08:37:54'),
(10, 'simon', 'thierry', 'thierrysimon@email.com', '$2b$10$LrUdh3FrJB8Swmq1k3GnCecGMxqEBkcHzDCrQdQfvg8IDXisEOulq', 0, '2026-06-28 08:37:54'),
(19, 'titi', 'titi', 'titi@gmail.com', '$2b$10$RbNyxn/aPLJEiyhCVRx3V.Zr9eVQn9LwJagp.kEzhpB0A3z6IDg0W', NULL, '2026-06-30 14:48:52');

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
-- Index pour la table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`contact_id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `annonce_id` (`annonce_id`),
  ADD KEY `utilisateur_id` (`expediteur_id`),
  ADD KEY `utilisateur_id_1` (`destinataire_id`);

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
  MODIFY `annonce_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `categorie_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `contact_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `photo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `utilisateur_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
