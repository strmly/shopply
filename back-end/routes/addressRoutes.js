import express from 'express';
import { AddressController } from '../controllers/AddressController.js';

const router = express.Router();
const addressController = new AddressController();

/**
 * Address Routes
 */
router.get('/search', (req, res, next) => addressController.searchAddresses(req, res, next));
router.get('/validate', (req, res, next) => addressController.validateCoordinates(req, res, next));
router.get('/summary', (req, res, next) => addressController.getMyAddressSummary(req, res, next));
router.get('/my-addresses', (req, res, next) => addressController.getMyAddresses(req, res, next));
router.get('/user/:userId', (req, res, next) => addressController.getAddressesByUserId(req, res, next));
router.get('/:id', (req, res, next) => addressController.getAddressById(req, res, next));
router.post('/', (req, res, next) => addressController.createAddress(req, res, next));
router.put('/:id', (req, res, next) => addressController.updateAddress(req, res, next));
router.put('/:id/set-default', (req, res, next) => addressController.setDefaultAddress(req, res, next));
router.delete('/:id', (req, res, next) => addressController.deleteAddress(req, res, next));

export default router;











