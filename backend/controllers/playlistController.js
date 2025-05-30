const Playlist = require('../models/Playlist');
const User = require('../models/User');

const createPlaylist = async (req, res) => {
  try {
    const { title, description, coverImage, genre, tracks = [] } = req.body;

    const playlist = new Playlist({
      title,
      description,
      coverImage,
      genre,
      tracks,
      createdBy: req.userId
    });

    await playlist.save();

    await User.findByIdAndUpdate(req.userId, {
      $push: { playlists: playlist._id }
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .populate('tracks')
      .populate('likes', 'username');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const { title, description, coverImage, genre, tracks = [] } = req.body;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { title, description, coverImage, genre, tracks},
      { new: true, runValidators: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or not authorized' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or not authorized' });
    }

    await User.findByIdAndUpdate(req.userId, {
      $pull: { playlists: playlist._id }
    });

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleLikePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const likeIndex = playlist.likes.indexOf(req.userId);

    if (likeIndex === -1) {
      playlist.likes.push(req.userId);
      await playlist.save();
      res.json({ message: 'Playlist liked' });
    } else {
      playlist.likes.splice(likeIndex, 1);
      await playlist.save();
      res.json({ message: 'Playlist unliked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavoritePlaylist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const favoriteIndex = user.favorites.indexOf(req.params.id);

    if (favoriteIndex === -1) {
      user.favorites.push(req.params.id);
      await user.save();
      res.json({ message: 'Playlist added to favorites' });
    } else {
      user.favorites.splice(favoriteIndex, 1);
      await user.save();
      res.json({ message: 'Playlist removed from favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPlaylists = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required'
      });
    }

    console.log(`Searching for: "${query}"`);

    const matchedUsers = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('_id');

    const userIds = matchedUsers.map(user => user._id);

    const playlists = await Playlist.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } },
        { createdBy: { $in: userIds } }
      ]
    })
    .populate('createdBy', 'username avatar')
    .select('title coverImage createdBy genre likes')
    .lean();

    console.log(`Found ${playlists.length} playlists`);

    res.status(200).json({
      success: true,
      data: playlists
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const getAllPlaylists = async (req, res) => {
  try {
    const playlist = await Playlist.find()
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 })

      console.log('Плейлисты:', playlist);
    res.json(playlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  toggleLikePlaylist,
  toggleFavoritePlaylist,
  searchPlaylists,
  getAllPlaylists
};