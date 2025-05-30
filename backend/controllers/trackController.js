const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

const addTrack = async (req, res) => {
  try {
    const { title, artist, audioUrl, duration, genre } = req.body;

    const track = new Track({
      title,
      artist,
      audioUrl,
      duration,
      genre,
      addedBy: req.userId,
      isApproved: true
    });

    await track.save();
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suggestTrack = async (req, res) => {
  try {
    const { title, artist, audioUrl, duration, genre } = req.body;

    const track = new Track({
      title,
      artist,
      audioUrl,
      duration,
      genre,
      addedBy: req.userId,
      isApproved: false
    });

    await track.save();
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedTracks = async (req, res) => {
  try {
    const { search, genre } = req.query;
    const filter = { isApproved: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      filter.genre = genre;
    }

    const tracks = await Track.find(filter)
      .sort({ createdAt: -1 });

    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ isApproved: false })
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ message: 'Трек не найден' });
    res.json(track);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const addTrackToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { 
        _id: req.params.playlistId, 
        createdBy: req.userId 
      },
      { 
        $addToSet: { tracks: req.params.trackId } 
      },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or not authorized' });
    }

    res.json({ message: 'Track added to playlist successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find()
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 })

    res.json(tracks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const removeTrackFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { 
        _id: req.params.playlistId, 
        createdBy: req.userId 
      },
      { 
        $pull: { tracks: req.params.trackId } 
      },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or not authorized' });
    }

    res.json({ message: 'Track removed from playlist successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTrack,
  suggestTrack,
  approveTrack,
  getApprovedTracks,
  getPendingTracks,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getTrackById,
  getAllTracks
};