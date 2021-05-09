/**
 * Module for HomeController.
 *
 * @author Akram Kadri
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */
export default class HomeController {
  /**
   * Shows user dashboard.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  dashboard (req, res, next) {
    res.status(200).json({ success: true, userData: req.user })
  }
}
