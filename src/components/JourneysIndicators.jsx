import React from 'react';
import { Box, Text, Heading, Button } from '@chakra-ui/react';
import { fetchJourneyStatistics } from '../utils/requestFunctions';
import { saveFile } from './FileContent';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';
import { CSVLink } from 'react-csv';
import { i18n } from '../translate/i18n';
import { ExportsButtons } from './ExportsButtons';

const JourneysIndicators = ({project}) => {
    const [journeyStatistics, setJourneyStatistics] = React.useState(null);
    const [doc, setDoc] = React.useState(null);
    const [csv, setCsv] = React.useState({headers: '', data: ''});
    const accessToken = localStorage.getItem('accessToken');

    const usersCount = project?.users.length;
    const activeUsers = journeyStatistics?.people_active_count
    const inactiveUsers = usersCount - activeUsers;
    const activeUsersEngagement = Math.round(journeyStatistics?.participation * 100);

    const questionsCount = journeyStatistics?.question_count;
    const answersCount = journeyStatistics?.parent_comments_count;
    const expectedComments = activeUsers * questionsCount;
    const questionsEngagement = answersCount / (questionsCount * activeUsers) * 100;

    const commentsCount = journeyStatistics?.reply_comments_count;
    const agreementsCount = journeyStatistics?.agreements_comments_count;
    const interactionsCount = commentsCount + agreementsCount;
    const reducedAnswers = answersCount / 2;
    const expectedInteraction = activeUsers * reducedAnswers;
    const debateEngagement = (interactionsCount / expectedInteraction) * 100;

    const divergenceEngagement = (questionsEngagement + debateEngagement) / 2;
    
// 
    React.useEffect(() => {
        fetchJourneyStatistics(accessToken, project?.id)
            .then(stats => setJourneyStatistics(stats));
    }, [project]);

    

    React.useEffect(() => {
        const {doc, csvHeaders, csvData} = saveFile(
            activeUsersEngagement,
            usersCount, 
            inactiveUsers, 
            questionsEngagement,
            questionsCount, 
            answersCount, 
            expectedComments, 
            debateEngagement, 
            commentsCount, 
            agreementsCount,
            interactionsCount,
            expectedInteraction,
            divergenceEngagement
        );
        setDoc(doc);
        setCsv({headers: csvHeaders, data: csvData});

    }, [journeyStatistics]);

    function saveDocx() {
        Packer.toBlob(doc).then((blob) => {
            console.log(blob);
            saveAs(blob, 'indicadores da jornada.docx');
            console.log('Document created successfully');
        });
    }

    React.useEffect(() => {
        console.log(csv)
    }, [csv]);
    

    return (
      <>
        <ExportsButtons project={project} saveFile={saveDocx} data={csv.data} headers={csv.headers || ''}/>
        <Heading as="h3" size="lg" mb={12} mt={3} >
            {i18n.t('main.heading')}
        </Heading>
        {project &&
        <>
            <Box>
                <Text>{i18n.t('main.p1p4p7p11_1')} <b>{i18n.t('main.p1bold1')}</b> {i18n.t('main.p1_2')}<b> {activeUsersEngagement.toFixed(2)}%</b></Text>
                <br/>
                <Text>{i18n.t('main.p2')} {usersCount}</Text>
                <Text>{i18n.t('main.p3')} {inactiveUsers}</Text>
                <br/>
                <Text>{i18n.t('main.p1p4p7p11_1')} <b>{i18n.t('main.p4bold1')}</b> {i18n.t('main.p4p7p11_3')} <b>{questionsEngagement.toFixed(2)}%</b></Text>
                <br/>
                <Text>{i18n.t('main.p5')} {questionsCount}</Text>
                <Text>{i18n.t('main.p6_1')} {answersCount} {i18n.t('main.p6p10_2')} {expectedComments} {i18n.t('main.p6p10_3')}</Text>
                <br/>
                <Text>{i18n.t('main.p1p4p7p11_1')} <b>{i18n.t('main.p7bold')}</b> {i18n.t('main.p4p7p11_3')} <b>{debateEngagement.toFixed(2)}%</b></Text>
                <br/>
                <Text>{i18n.t('main.p8')} {commentsCount}</Text>
                <Text>{i18n.t('main.p9')} {agreementsCount}</Text>
                <Text>{i18n.t('main.p10_1')} {interactionsCount} {i18n.t('main.p6p10_2')} {expectedInteraction} {i18n.t('main.p6p10_3')}</Text>
                <br/>
                <Text>{i18n.t('main.p1p4p7p11_1')} <b>{i18n.t('main.p11bold')}</b> {i18n.t('main.p4p7p11_3')} <b>{divergenceEngagement.toFixed(2)}%</b></Text>
            </Box>
      </>
        }
      </>
    
    
  )
};

export default JourneysIndicators;