const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await authService.createUser(email, password);
      const tokens = authService.generateTokens(user);

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user._id, email: user.email, matchState: user.matchState },
        tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await authService.verifyUser(email, password);
      const tokens = authService.generateTokens(user);

      res.status(200).json({
        message: 'Login successful',
        user: { id: user._id, email: user.email, matchState: user.matchState },
        tokens
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const user = await authService.verifyRefreshToken(refreshToken);
      const tokens = authService.generateTokens(user);

      res.status(200).json({ tokens });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.findUserById(req.user.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
