import getConfig from 'next/config';
import { sign } from 'jsonwebtoken';
import axios from 'axios';

const { serverRuntimeConfig } = getConfig();

export default async ({ body: { id, votes } }, res) => {
  try {
    const jwt = sign({
      student_id: id,
      votes: votes.map((vote) => ({ proj_id: vote.id, choice: vote.rank }))
    }, serverRuntimeConfig.matchSecret);

    const url = `${serverRuntimeConfig.matchUrl}/votes/${jwt}`;
    const result = (await axios({ url, method: 'PUT', responseType: 'json' })).data;
    if (result.ok) {
      res.send({ 'ok': true });
    } else {
      res.send({ 'ok': false });
    }

  } catch (err) {
    console.error(err);
    res.send({ 'ok': false });
  }
}
