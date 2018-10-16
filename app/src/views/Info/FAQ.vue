<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" width="500">
            <!-- <v-btn slot="activator" color="red lighten-2" dark >
                FAQ
            </v-btn> -->
            <v-list-tile-title slot="activator">FAQ</v-list-tile-title>
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title >
                    Privacy Policy
                </v-card-title>
                <v-card-text>
                    <h3>What is REACH?</h3>
                    <p>
                    REACH is a platform designed to combine institutional data with crowd-sourced information (including social media, instant messaging, and relevant RSS feeds) in real-time to monitor and manage emergencies. REACH has two main objectives: (1) helping MSF to streamline our data sharing activities and improve our information management in emergency situation (2) improve the response time by better and faster understanding the evolving situation on the ground (crowdsourcing by report card; screening social media and news feed; AI and ML for better analysis of past responses in the area).
                    </p>

                    <h3>Who is responsible for the platform?</h3>
                    <p>
                    REACH is an initiative of the MSF Hong Kong OSU (Operation Support Unit), in collaboration with the London-based software development cooperative, User Group Inc. LLP and Across the Cloud Pty Ltd. The ERSU (Emergency Response Support Unit) manages the platform and makes it available for operational usage to colleagues throughout the Movement.
                    </p>

                    <h3>Who pays for REACH?</h3>
                    <p>
                    REACH is currently in its second stage of development, which is funded by a Transformational Investment Capacity Incubator grant. The first phase of development was funded by the ERSU in Hong Kong. The second phase, including the extension would benefit from the TIC grant. Work on governance and structure will be done before moving ahead to the Phase 3 of development.
                    </p>

                    <h3>Who can access REACH?</h3>
                    <p>
                    In its current phase, REACH can gather, sort, display and management real-time disaster information in Southeast Asia. Members of the movement who want to use the tool to this end (edit permission) should contact Lucie Gueuning with a request for operators access. However, all members of the Movement are now able to login to a view only set of features using their MSF credentials as per Office 365.
                    </p>

                    <p>Users from MSF external network can send out report cards and contact cards to collect information that is then presented in REACH.</p>

                    <h3>Is REACH GDPR compliant?</h3>

                    <p>Based on advice from a consultant, we have made REACH compliant with the GDPR.</p>

                    <h3>Who can enter contact details?</h3>

                    <p>Either contacts themselves enter their personal contact details thanks to our contact cards, or MSF staff enter, as a private list, their own contact network in order to share their details with specific colleagues within the Movement. All MSF staff acknowledge having received consent from contacts to enter their information into the MSF database.</p>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="dialog = false" > I accept </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>

export default {
    name: 'info-FAQ',
    data () {
        return {
            dialog: false
        };
    }
};

</script>
