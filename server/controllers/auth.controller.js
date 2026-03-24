const authService = require('../services/auth.service');

class AuthController {
  async signup(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await authService.createUser(email, password);
      const tokens = authService.generateTokens(user);

      res.status(201).json({
        message: 'User created successfully',
        user: { id: user._id, email: user.email, matchState: user.matchState },
        tokens
      });
    } catch (error) {
      if (error.message === 'Email already in use') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
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
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
