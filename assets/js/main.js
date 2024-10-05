$(document).on('click', '#enter', function() {
	$('#welcome').remove();
	//$('#fast-forward').click();
});

$(document).on('click', '#togglelist', function() {
	$('#tracklist').toggle();
});

$(document).ready(function() {
	var $audio = $('#audio-player'); // Use jQuery to select the audio element

	sessionStorage.setItem("id", 0)

	// Function to reset the music player to its default state
	function resetMusicPlayer() {
		$audio[0].pause(); // Stop any currently playing audio
		$audio.prop('src', ''); // Clear the current audio source
		// Reset UI elements to their default states
		$('#music-player .fs-5').text('Song Title - Artist');
		$('#music-player .fs-6').text('Music Artist Name');
		// Change all track icons back to play icons and remove any loading spinners
		$('.play-btn i').removeClass().addClass('fi fi-rr-play');
		$('#playpause i').removeClass('fi-rr-pause').addClass('fi-rr-play'); // Reset play/pause button to play
	}

	// Function to fetch and play a song by its data-id
	function fetchAndPlaySong(songId, trackElement) {
		$.ajax({
			url: '/get-song', // Your endpoint to fetch song details
			type: 'GET',
			data: { id: songId },
			cache: false,
			dataType: 'json',
			beforeSend: function() {
				// Show loading indicator only for the clicked element
				trackElement.find('i').first().removeClass().addClass('spinner-border spinner-border-sm');
				$('#playpause').html('<div class="spinner-border" style="width: 2.5rem; height: 2.5rem;" role="status"></div>');
			},
			success: function(response) {
				if(response.status === "success"){
					$audio.prop('src', response.fileUrl); // Set the source of the audio element
					$audio[0].load();
					$audio[0].play().catch(error => {
						console.error('Playback failed:', error);
						alert('Playback failed: The element has no supported sources or other error.');
					});

					// Update UI with song details
					$('#music-player #title').text(response.title);
					$('#music-player #artist').text(response.artist);

					sessionStorage.setItem("id", songId);
					$('.play-btn i').removeClass().addClass('fi fi-rr-play');
				}else{
					console.error("Error fetching song details.");
					alert("Could not load the song. Please try again.");
					resetMusicPlayer();
				}
			},
			error: function(xhr, status, error) {
				console.error("Error fetching song details: ", error);
				alert("Could not load the song. Please try again.");
				resetMusicPlayer();
			}
		});
	}

	// Delegate click event to any current or future '.play-btn' within the document
    $(document).on('click', '.play-btn', function() {
        var songId = $(this).data('id');
        fetchAndPlaySong(songId, $(this));
    });

    // Play/Pause button functionality using event delegation
    $(document).on('click', '#playpause', function() {
        var $audio = $('audio'); // Ensure $audio is defined in this scope
        if ($audio[0].paused && $audio.prop('src')) {
            $audio[0].play();
        } else {
            $audio[0].pause();
        }
    });

    // Fast-forward button functionality using event delegation
    $(document).on('click', '#fast-forward', function() {
        var currentSongId = parseInt(sessionStorage.getItem("id"), 10); // Assume 'id' is stored correctly
        var nextSongId = currentSongId + 1;
        var $nextSong = $('.play-btn[data-id="' + nextSongId + '"]');

        if ($nextSong.length) {
            fetchAndPlaySong(nextSongId, $nextSong);
        } else {
            // If no next song, loop back to the first song
            var $firstSong = $('.play-btn').first();
            fetchAndPlaySong($firstSong.data('id'), $firstSong);
        }
    });

	// Audio event listeners for updating UI
	$audio.on('play', function() {
		$('#playpause').html("<i class='fi-rr-pause'><i>");
		$("button[data-id='" + sessionStorage.getItem("id") + "']").find('i').removeClass().addClass('fi fi-rr-pause');
	}).on('pause', function() {
		 $('#playpause').html("<i class='fi-rr-play'><i>");
		$("button[data-id='" + sessionStorage.getItem("id") + "']").find('i').removeClass().addClass('fi fi-rr-play');
	});

	$audio.on('canplay', function() {
		// Hide the spinner and show the correct icon for the current track
		if (sessionStorage.getItem("id") !== undefined) {
			// Now use currentSongId which is defined within this scope
			$("button[data-id='" + sessionStorage.getItem("id") + "']").find('i').removeClass().addClass('fi fi-rr-pause');

		}
	});

	$audio.on('waiting', function() {
		// Show spinner on the current track when waiting for data
		var currentTrackElement = $('.play-btn').find('audio[src="' + $audio.prop('src') + '"]');
		currentTrackElement.find('i').first().removeClass().addClass('spinner-border spinner-border-sm');
	});

	$audio.on('ended', function() {
		// Optionally, move to the next song automatically
	});
});