export class NostrClient {
  constructor(url) {
    this.url = url;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (error) => reject(error);
    });
  }

  async fetchProfile(npub) {
    return new Promise((resolve, reject) => {
      this.ws.send(
        JSON.stringify(["REQ", "1", { kinds: [0], authors: [npub] }])
      );
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data[0] === "EVENT" && data[2].content) {
          const profile = JSON.parse(data[2].content);
          resolve(profile);
        }
      };
    });
  }

  async postHighScore(npub, score, unlockedEmojis) {
    const event = {
      kind: 69420,
      content: `I scored ${score} in the snake game! #snakegame`,
      tags: [
        ["t", "snakegame"],
        ["u", unlockedEmojis.join(",")],
        ["s", score.toString()],
      ],
      created_at: Math.floor(Date.now() / 1000),
    };
    const signedEvent = await window.nostr.signEvent(event);
    return this.publishEvent(signedEvent);
  }

  async publishEvent(event) {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify(["EVENT", event]));
      this.ws.onmessage = (msg) => {
        console.log("Event posted:", msg.data);
        resolve(msg.data);
      };
    });
  }

  async fetchHighScores() {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify(["REQ", "2", { kinds: [69420] }]));
      const highScores = [];
      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data[0] === "EVENT" && data[2].content) {
          const scoreTag = data[2].tags.find((tag) => tag[0] === "s");
          if (scoreTag) {
            const score = scoreTag[1];
            const profile = data[2].pubkey;
            const profileData = await this.fetchProfile(profile);
            highScores.push({
              name: profileData.name || profile,
              picture: profileData.picture,
              score: parseInt(score, 10),
            });
          }
        } else if (data[0] === "EOSE") {
          resolve(highScores.sort((a, b) => b.score - a.score));
        }
      };
    });
  }
}
