import express from 'express';
import {
   getAvatarByIdUser,
   postAvatar
} from '../controllers/avatarControllers.js';

/**
 * Routeur Express dédié au CRUD.
 * @type {express.Router}
 * @const
 */
const router = express.Router();
/**
 * Route : crée un avatar
 * @name POST/
 * @function
 * @param {string} path - `/`
 * @param {Function} postAvatar - Contrôleur créant un avatar.
 */
router.post('/', postAvatar);

router.get('/:id', getAvatarByIdUser);

export default router;
