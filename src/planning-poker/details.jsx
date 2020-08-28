import React, {useState} from "react";
import {Row, Col, Form, Input, FormGroup, Spinner, Button} from 'reactstrap';
import {useParams} from 'react-router-dom';
import {gql, useSubscription, useMutation} from '@apollo/client';
import seedColor from 'seed-color';
import AvatarImg from '../components/avatar';
import {useAuth0} from "@auth0/auth0-react";
import {SetDiv} from './details-styled';

const GET_SESSION_PARTICIPANTS = gql`
subscription session_details($id: uuid!) {
  sessions_by_pk(id: $id) {
    sessions_participants {
      user {
        name
        id
      }
    }
    name
    is_finished
  }
}
`;

const INSERT_SES_PAR = gql`
mutation isp($session_id: uuid = "", $user_id: String = "") {
  insert_sessions_participants_one(object: {user_id: $user_id, session_id: $session_id}) {
    id
  }
}
`;



const PokerDetail = () => {
  const {id} = useParams();
  const {user, isLoading} = useAuth0();
  const {loading: lodu, data: dpar} = useSubscription(
    GET_SESSION_PARTICIPANTS,
    {variables: {id}}
  );
  const [isp] = useMutation(INSERT_SES_PAR);
  const [valueSets, setValueSets] = useState([1, 2, 3, 4, 5, 8]);

  let found = false;
  if (dpar && dpar.sessions_by_pk){
    // check if user hasnt joined the session yet
    dpar.sessions_by_pk.sessions_participants.forEach((su) => {
      if (su.user.id === user.sub){
        found = true;
      }
    });
  }

  if (! lodu && ! isLoading && ! found){
    try {
      isp({variables: {session_id: id, user_id: user.sub}}).then(() => {});
    } catch (err){
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  const changeSet = (event) => {
    setValueSets(event.target.value.split(','));
  };

  return (
    <Row className="mt-4">
      <Col sm="6" md="4" lg="3">
        <h4>Participants</h4>
        <hr />
        <ul style={{paddingLeft: 0}}>
          {lodu && <Spinner></Spinner>}
          {dpar && dpar.sessions_by_pk.sessions_participants.map(su =>
            <li key={su.user.id} style={{listStyle: 'none', color: seedColor(su.user.id).toHex(), marginBottom: '10px'}}>
              <AvatarImg id={su.user.id} size={40}></AvatarImg>
              <b style={{marginLeft: '10px'}}>{su.user.name}</b>
            </li>
          )}
        </ul>
      </Col>
      <Col>
        <h4>Session: {dpar && dpar.sessions_by_pk.name}</h4><hr />
        {/* <Button color="light">New</Button> */}
        <Row>
          <Col>
            <Form>
              <FormGroup>
              <Input type="select" name="select" id="exampleSelect" onChange={changeSet}>
                <option value={[1, 2, 3, 4, 5, 8]}>1, 2, 3, 5, 8</option>
                <option value={[4, 8, 12, 16, 24, 40]}>4h, 8h, 12h, 16h, 24h, 40h</option>
              </Input>
              </FormGroup>
            </Form>
          </Col>
          <Col>
            <Button color="success" className="float-right">Reveal!!!</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            {valueSets.map((v, idx) =>
              <SetDiv key={idx}>{v}</SetDiv>
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default PokerDetail;