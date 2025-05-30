const User = require('../models/User');
const Playlist = require('../models/Playlist');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -__v')
      .populate('playlists', 'title coverImage')
      .populate('favorites', 'title coverImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { username, avatar },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.userId })
      .select('title description coverImage createdAt tracks')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavoritePlaylist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const favoriteIndex = user.favorites.indexOf(req.params.id);

    if (favoriteIndex === -1) {
      user.favorites.push(req.params.id);
      await user.save();
      res.json({ 
        success: true,
        isFavorite: true,
        message: 'Playlist added to favorites'
      });
    } else {
      user.favorites.splice(favoriteIndex, 1);
      await user.save();
      res.json({ 
        success: true,
        isFavorite: false,
        message: 'Playlist removed from favorites'
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'favorites',
        select: 'title description coverImage genre createdBy likes',
        populate: [
          {
            path: 'createdBy',
            select: 'username avatar'
          },
          {
            path: 'likes',
            select: 'username'
          }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
};


module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserPlaylists,
  getUserFavorites,
  toggleFavoritePlaylist
};