const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -__v')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -__v');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Playlist.deleteMany({ createdBy: user._id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlaylists = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre) query.genre = genre;

    const playlists = await Playlist.find(query)
      .populate('createdBy', 'username avatar')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await Playlist.countDocuments(query);

    res.json({
      playlists,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    await User.updateMany(
      { favorites: playlist._id },
      { $pull: { favorites: playlist._id } }
    );

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTracksAdmin = async (req, res) => {
  try {
    const { search, isApproved, genre, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }

    if (genre) {
      query.genre = genre;
    }

    const tracks = await Track.find(query)
      .populate('addedBy', 'username')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await Track.countDocuments(query);

    res.json({
      tracks,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    await Playlist.updateMany(
      { tracks: track._id },
      { $pull: { tracks: track._id } }
    );

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [usersCount, playlistsCount, tracksCount, pendingTracksCount] = await Promise.all([
      User.countDocuments(),
      Playlist.countDocuments(),
      Track.countDocuments({ isApproved: true }),
      Track.countDocuments({ isApproved: false })
    ]);

    res.json({
      usersCount,
      playlistsCount,
      tracksCount,
      pendingTracksCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true,
      },
      { new: true }
    ).populate('addedBy', 'username');
    
    if (!track) {
      return res.status(404).json({ message: 'Трек не найден' });
    }
    
    res.json({
      success: true,
      data: track,
      message: 'Трек успешно одобрен'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
  getPlaylists,
  deletePlaylist,
  getAllTracksAdmin,
  deleteTrack,
  getStats,
  approveTrack
};
