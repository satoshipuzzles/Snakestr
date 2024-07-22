export class NostrClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        console.log("WebSocket connected");
        resolve();
      };
      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    });
  }

  async fetchProfile(pubkey) {
    return new Promise((resolve, reject) => {
      const reqId = Math.random().toString(36).substring(7);
      console.log(`Fetching profile for ${pubkey}`);
      this.ws.send(
        JSON.stringify(["REQ", reqId, { kinds: [0], authors: [pubkey] }])
      );

      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data[0] === "EVENT" && data[1] === reqId && data[2].content) {
          try {
            const profile = JSON.parse(data[2].content);
            console.log(`Profile fetched for ${pubkey}:`, profile);
            this.ws.removeEventListener("message", handleMessage);
            resolve(profile);
          } catch (error) {
            console.error(`Error parsing profile JSON for ${pubkey}:`, error);
            this.ws.removeEventListener("message", handleMessage);
            resolve({ name: pubkey, picture: null });
          }
        } else if (data[0] === "EOSE" && data[1] === reqId) {
          console.log(`No profile found for ${pubkey}`);
          this.ws.removeEventListener("message", handleMessage);
          resolve({ name: pubkey, picture: null });
        }
      };

      this.ws.addEventListener("message", handleMessage);
    });
  }

  async fetchHighScores() {
    return new Promise((resolve, reject) => {
      const highScores = [];
      const reqId = Math.random().toString(36).substring(7);
      console.log("Fetching high scores");
      this.ws.send(JSON.stringify(["REQ", reqId, { kinds: [69420] }]));

      const handleMessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data[0] === "EVENT" && data[2].kind === 69420) {
          const scoreTag = data[2].tags.find((tag) => tag[0] === "s");
          if (scoreTag) {
            const score = scoreTag[1];
            const pubkey = data[2].pubkey;
            console.log(`Found high score: ${score} for ${pubkey}`);
            const profileData = await this.fetchProfile(pubkey);
            highScores.push({
              name: profileData.name || pubkey,
              picture: profileData.picture,
              score: parseInt(score, 10),
            });
            console.log(
              `Added high score: ${JSON.stringify(
                highScores[highScores.length - 1]
              )}`
            );
          }
        } else if (data[0] === "EOSE" && data[1] === reqId) {
          console.log("Finished fetching high scores");
          this.ws.removeEventListener("message", handleMessage);
          const uniqueScores = this.removeDuplicates(highScores);
          console.log("Unique scores:", uniqueScores);
          resolve(uniqueScores.sort((a, b) => b.score - a.score));
        }
      };

      this.ws.addEventListener("message", handleMessage);
    });
  }

  removeDuplicates(highScores) {
    const seen = new Map();
    return highScores.filter((score) => {
      if (seen.has(score.name)) {
        return seen.get(score.name).score < score.score;
      }
      seen.set(score.name, score);
      return true;
    });
  }
}
