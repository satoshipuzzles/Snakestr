<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Word List Marketplace</title>
    <style>
        body {
            background-color: #EF8C56;
            color: #ffffff;
            font-family: 'Arial', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0;
            position: relative;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            text-align: center;
            width: 100%;
            max-width: 600px;
        }
        .word-list {
            padding: 20px;
            margin: 10px 0;
            border-radius: 10px;
            background-color: #ffffff;
            color: #000000;
            text-align: left;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .word-list-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .word-list-header img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .username {
            margin-right: 10px;
            color: #888;
            font-weight: bold;
            flex-shrink: 0;
        }
        .word-list-name {
            font-weight: bold;
            flex-grow: 1;
        }
        .word-list p {
            margin: 0;
            font-size: 14px;
        }
        .author-npub {
            font-size: 12px;
            color: #888;
            word-break: break-all;
        }
        .buttons {
            margin-top: 10px;
            display: flex;
            gap: 10px;
        }
        .buttons button {
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background-color: #4CAF50;
            color: white;
            transition: background-color 0.3s;
        }
        .buttons button:hover {
            background-color: #45a049;
        }
        .buttons button.delete {
            background-color: #f44336;
        }
        .buttons button.delete:hover {
            background-color: #e41e10;
        }
        .header {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header-button {
            font-size: 24px;
            cursor: pointer;
            background: none;
            border: none;
            color: #ffffff;
        }
        #profile-pic img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
        .hidden {
            display: none;
        }
        .iframe-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .iframe-container iframe {
            width: 80%;
            height: 80%;
        }
        .iframe-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.4);
            padding-top: 60px;
        }
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .modal-button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            margin: 5px;
            border-radius: 5px;
            align-self: flex-start;
        }
        .modal-label {
            font-weight: bold;
            color: #000000;
            margin-bottom: 10px;
        }
        .modal-input {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            margin-bottom: 10px;
            border: none;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            background-color: #ffffff;
            color: #1f1f1f;
            resize: none;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div class="header">
        <button class="header-button" onclick="goHome()">🏡</button>
        <div class="header-button" onclick="openIframe()">⚡️</div>
        <div id="profile-pic" class="hidden">
            <span id="profile-emoji">🤖</span>
        </div>
    </div>
    <div class="container">
        <h1>Word List Marketplace</h1>
        <div id="marketplace-list">
            <!-- Marketplace word lists will be displayed here -->
        </div>
    </div>

    <div id="iframeContainer" class="iframe-container">
        <iframe id="iframe" src="about:blank" frameborder="0"></iframe>
        <button class="iframe-close" onclick="closeIframe()">✖️</button>
    </div>

    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Edit Word List</h2>
            <label for="modalListName" class="modal-label">List Name:</label>
            <input type="text" id="modalListName" class="modal-input">
            <label for="modalCustomWords" class="modal-label">Enter words separated by commas:</label>
            <textarea id="modalCustomWords" class="modal-input" placeholder="Enter words separated by commas"></textarea>
            <label for="modalColorPicker" class="modal-label">Select a color for the list:</label>
            <input type="color" id="modalColorPicker" value="#6FEF65">
            <button class="modal-button" id="saveAndPublishButton">Save and Publish</button>
        </div>
    </div>

    <script>
        let npub = null;
        let customWordLists = JSON.parse(localStorage.getItem('customWordLists')) || [];
        let editIndex = null;

        document.addEventListener('DOMContentLoaded', async () => {
            const profilePic = document.getElementById('profile-pic');
            const storedProfile = JSON.parse(localStorage.getItem('profile'));

            if (storedProfile) {
                npub = storedProfile.npub;
                profilePic.innerHTML = `<img src="${storedProfile.picture}" alt="Profile Picture">`;
                profilePic.classList.remove('hidden');
            } else if (window.nostr && window.nostr.getPublicKey) {
                try {
                    npub = await window.nostr.getPublicKey();
                    const profile = await fetchProfile(npub);
                    if (profile && profile.picture) {
                        profilePic.innerHTML = `<img src="${profile.picture}" alt="Profile Picture">`;
                        profilePic.classList.remove('hidden');
                        localStorage.setItem('profile', JSON.stringify({ npub, picture: profile.picture }));
                    }
                } catch (error) {
                    console.error('Error logging in:', error);
                }
            } else {
                alert('NIP-07 extension not found.');
            }

            loadMarketplace();
        });

        async function fetchProfile(npub) {
            return new Promise((resolve, reject) => {
                const ws = new WebSocket('wss://relay.damus.io');
                ws.onopen = () => {
                    ws.send(JSON.stringify(["REQ", "1", { kinds: [0], authors: [npub] }]));
                };
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data[0] === "EVENT" && data[2].content) {
                        const profile = JSON.parse(data[2].content);
                        ws.close();
                        resolve(profile);
                    }
                };
                ws.onerror = (error) => {
                    reject(error);
                };
            });
        }

        async function loadMarketplace() {
            const marketplaceList = document.getElementById('marketplace-list');
            marketplaceList.innerHTML = ''; // Clear the list only once at the beginning
            const ws = new WebSocket('wss://relay.damus.io');
            ws.onopen = () => {
                ws.send(JSON.stringify(["REQ", "2", { kinds: [31664] }]));
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data[0] === "EVENT" && data[2].content) {
                        const listContent = JSON.parse(data[2].content);
                        const profile = data[2].pubkey;
                        fetchProfile(profile).then(profileData => {
                            const div = document.createElement('div');
                            div.className = 'word-list';
                            div.style.backgroundColor = listContent.color;
                            div.innerHTML = `
                                <div class="word-list-header">
                                    <img src="${profileData.picture}" alt="Profile Picture">
                                    <span class="username">${profileData.name || profileData.nip05}</span>
                                    <span class="word-list-name">${listContent.name}</span>
                                </div>
                                <div class="author-npub">${profile}</div>
                                <div class="words hidden">
                                    <p>${listContent.words.join(', ')}</p>
                                    <div class="buttons">
                                        ${profile === npub ? `<button onclick='editMarketplaceList(${JSON.stringify(listContent)}, "${data[2].id}")'>Edit</button>
                                        <button class='delete' onclick='deleteMarketplaceList("${data[2].id}")'>Delete</button>` : ''}
                                        <button onclick='importList(${JSON.stringify(listContent)}, "${profileData.picture}")'>Import</button>
                                    </div>
                                </div>
                            `;
                            marketplaceList.appendChild(div); // Append each note to the list
                            div.addEventListener('click', () => toggleWords(div));
                        });
                    }
                } catch (error) {
                    console.error('Error processing data:', error, event.data);
                }
            };
            ws.onerror = (error) => {
                console.error('Error loading marketplace:', error);
            };
        }

        function toggleWords(div) {
            const wordsDiv = div.querySelector('.words');
            wordsDiv.classList.toggle('hidden');
        }

        function openModal(listContent, id) {
            document.getElementById('modalListName').value = listContent.name;
            document.getElementById('modalCustomWords').value = listContent.words.join(', ');
            document.getElementById('modalColorPicker').value = listContent.color;
            document.getElementById('editModal').style.display = "block";

            document.getElementById('saveAndPublishButton').onclick = async function() {
                await saveAndPublishEditedMarketplaceWords(listContent, id);
                closeModal();
            };
        }

        function closeModal() {
            document.getElementById('editModal').style.display = "none";
        }

        async function saveAndPublishEditedMarketplaceWords(listContent, id) {
            const listName = document.getElementById('modalListName').value;
            const words = document.getElementById('modalCustomWords').value.split(',').map(word => word.trim());
            const color = document.getElementById('modalColorPicker').value;

            if (listName && words.length > 0) {
                listContent.name = listName;
                listContent.words = words;
                listContent.color = color;

                await publishWordList(listContent, id);
                alert('Word list updated and published!');
            } else {
                alert('Please enter a list name and words.');
            }
        }

        async function editMarketplaceList(listContent, id) {
            openModal(listContent, id);
        }

        async function deleteMarketplaceList(id) {
            const event = {
                kind: 5,  // kind 5 is used for deletion in Nostr
                content: '',
                tags: [
                    ["e", id]  // e tag to specify the event ID of the list to be deleted
                ],
                pubkey: npub,
                created_at: Math.floor(Date.now() / 1000)
            };

            try {
                const signedEvent = await window.nostr.signEvent(event);
                postEvent(signedEvent);
                alert('Word list deleted from Nostr!');
                loadMarketplace();
            } catch (error) {
                console.error('Error deleting word list:', error);
            }
        }

        async function publishWordList(listContent, id) {
            const event = {
                kind: 31664,
                content: JSON.stringify(listContent),
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["n", listContent.name],
                    ["l", listContent.words.join(',')],
                    ["c", listContent.color],
                    ["d", npub]
                ],
                pubkey: npub
            };

            try {
                const signedEvent = await window.nostr.signEvent(event);
                postEvent(signedEvent);
                alert('Word list published to Nostr!');
            } catch (error) {
                console.error('Error publishing word list:', error);
            }
        }

        function postEvent(event) {
            const ws = new WebSocket('wss://relay.damus.io');
            ws.onopen = () => {
                ws.send(JSON.stringify(["EVENT", event]));
            };
            ws.onmessage = (msg) => {
                console.log('Event posted:', msg.data);
                ws.close();
            };
            ws.onerror = (error) => {
                console.error('Error posting event:', error);
            };
        }

        function importList(listContent, creatorPicture) {
            listContent.creatorPicture = creatorPicture;
            customWordLists.push(listContent);
            localStorage.setItem('customWordLists', JSON.stringify(customWordLists));
            alert('List imported to your word lists!');
        }

        function openIframe() {
            document.getElementById('iframeContainer').style.display = 'flex';
            document.getElementById('iframe').src = 'https://zaplinks.lol/z.php?npub=npub1ymt2j3n8tesrlr0yhaheem6yyqmmwrr7actslurw6annls6vnrcslapxnz';
        }

        function closeIframe() {
            document.getElementById('iframeContainer').style.display = 'none';
            document.getElementById('iframe').src = 'about:blank';
        }

        function goHome() {
            window.location.href = '/';
        }
    </script>
</body>
</html>
